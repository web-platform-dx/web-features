import assert from "node:assert";

import { Temporal } from "@js-temporal/polyfill";

import { feature } from "../browser-compat-data/feature";
import { Release } from "../browser-compat-data/release";
import { browsers, highReleases, lowReleases } from "./core-browser-set";
import { support } from "./support";
import { Browser } from "../browser-compat-data/browser";
import {
  BASELINE_LOW_TO_HIGH_DURATION,
  VERY_FAR_FUTURE_DATE,
} from "../constants";
import { Compat, defaultCompat } from "../browser-compat-data/compat";
import { toDateString, toHighDate } from "./date-utils";

interface FeatureSelector {
  compatKeys: [string, ...string[]];
  checkAncestors: boolean;
}

interface SupportStatus {
  compatKey?: string;
  baseline: "low" | "high" | false;
  baseline_low_date: string | null;
  baseline_high_date: string | null;
  support: Map<Browser, Release | undefined>;
  toJSON: () => string;
}

export function computeBaseline(
  featureSelector: FeatureSelector,
  compat: Compat = defaultCompat,
): SupportStatus {
  const { compatKeys } = featureSelector;
  const keys = featureSelector.checkAncestors
    ? compatKeys.flatMap((key) => withAncestors(key, compat))
    : compatKeys;

  const statuses = keys.map((key) => calculate(key, compat));

  const baseline = minStatus(statuses);

  let baseline_low_date: string | null = null;
  if (baseline !== false) {
    baseline_low_date = latestDate(
      statuses.map((status) => status.baseline_low_date),
    );
  }

  let baseline_high_date;
  if (baseline_low_date) {
    baseline_high_date = toDateString(toHighDate(baseline_low_date));
  } else {
    baseline_high_date = null;
  }

  return {
    baseline,
    baseline_low_date,
    baseline_high_date,
    support: minSupport(statuses.map((status) => status.support)),
    toJSON: function () {
      return jsonify(this);
    },
  };
}

function calculate(compatKey: string, compat: Compat): SupportStatus {
  const f = feature(compatKey);
  const s = support(f, browsers(compat), compat);

  // The next three statements compute the low, high, or neither status of a
  // given key. There are many ways to do this, but this is the one I picked.
  //
  // To check the Baseline low status, follow these steps:
  // 1. Get the set of releases that support a given feature (via
  //    `supportedBy`).
  // 2. Get the set of current releases for all the core browser set browsers
  //    (via `lowReleases`).
  // 3. If the first set is a superset of the second set, then it's Baseline
  //    low.

  // To check the Baseline high status, follow these steps:
  // 1. Get the set of releases that support a given feature (via
  //    `supportedBy`).
  // 2. Get the set of releases for all the core browser set browsers from the
  //    present to 30 months ago (via `highReleases`).
  // 3. If the first set is a superset of the second set, then it's Baseline
  //    high.
  //
  // This will all be much more obvious when we can use
  // `Set.prototype.isSupersetOf`.
  const allReleases = f.supportedBy({ only: browsers(compat), compat });
  const isBaselineLow = lowReleases(compat).every((r) =>
    allReleases.includes(r),
  );
  const isBaselineHigh = highReleases(compat).every((r) =>
    allReleases.includes(r),
  );

  const baseline =
    (isBaselineHigh ? "high" : false) || (isBaselineLow ? "low" : false);

  let baseline_low_date = null;
  let baseline_high_date = null;
  if (isBaselineLow) {
    const initialReleases = [...s.entries()].map(([, r]) => r);
    const keystoneRelease = initialReleases
      .sort((a, b) => {
        assert(a !== undefined);
        assert(b !== undefined);
        return Temporal.PlainDate.compare(
          a.date ?? VERY_FAR_FUTURE_DATE,
          b.date ?? VERY_FAR_FUTURE_DATE,
        );
      })
      .pop();

    assert(keystoneRelease instanceof Release);
    assert(keystoneRelease.date);
    baseline_low_date = toDateString(keystoneRelease.date);

    if (isBaselineHigh) {
      assert(keystoneRelease.date !== null);
      baseline_high_date = toDateString(toHighDate(keystoneRelease.date));
    }
  }

  return {
    compatKey,
    baseline,
    baseline_low_date,
    baseline_high_date,
    support: s,
    toJSON: function () {
      return jsonify(this);
    },
  };
}

function withAncestors(compatKey: string, compat: Compat): string[] {
  const items = compatKey.split(".");
  const ancestors: string[] = [];

  let current = items.shift();
  while (items.length) {
    current = `${current}.${items.shift()}`;

    const data = compat.query(current);
    if (typeof data === "object" && data !== null && "__compat" in data) {
      ancestors.push(current);
    }
  }
  return ancestors;
}

function minStatus(statuses: SupportStatus[]): "high" | "low" | false {
  let bestOf: "high" | "low" = "high";
  for (const { baseline } of statuses) {
    if (baseline === false) {
      return false;
    }
    if (baseline === "low") {
      bestOf = "low";
    }
    if (baseline === "high" && bestOf === "high") {
      bestOf = "high";
    }
  }
  return bestOf;
}

function minSupport(
  supports: Map<Browser, Release | undefined>[],
): Map<Browser, Release | undefined> {
  const collated = new Map<Browser, (Release | undefined)[]>();

  for (const support of supports) {
    for (const [browser, release] of support) {
      collated.set(browser, [...(collated.get(browser) ?? []), release]);
    }
  }

  const support: Map<Browser, Release | undefined> = new Map();
  for (const [browser, releases] of collated) {
    if (releases.includes(undefined)) {
      support.set(browser, undefined);
    } else {
      support.set(
        browser,
        releases
          .sort((r1, r2) => (r1 as Release).compare(r2 as Release))
          .at(-1),
      );
    }
  }
  return support;
}

function latestDate(dates: (string | null)[]): string | null {
  if (dates.some((date) => date === null)) {
    return null;
  }

  const sorted = dates
    .map((date) => {
      assert(date !== null);
      return Temporal.PlainDate.from(date);
    })
    .sort(Temporal.PlainDate.compare);

  assert(sorted.length >= 1);

  return sorted.at(-1)?.toString() ?? null;
}

function jsonify(status: SupportStatus): string {
  const { baseline_low_date, baseline_high_date } = status;
  const support: Record<string, string> = {};

  for (const [browser, release] of status.support.entries()) {
    if (release !== undefined) {
      support[browser.id] = release.version;
    }
  }

  if (status.baseline === "high") {
    return JSON.stringify(
      {
        baseline: status.baseline,
        baseline_low_date,
        baseline_high_date,
        support,
      },
      undefined,
      2,
    );
  }

  if (status.baseline === "low") {
    return JSON.stringify(
      {
        baseline: status.baseline,
        baseline_low_date,
        support,
      },
      undefined,
      2,
    );
  }

  return JSON.stringify(
    {
      baseline: status.baseline,
      support,
    },
    undefined,
    2,
  );
}
