import assert from "node:assert";

import { Temporal } from "@js-temporal/polyfill";

import { feature } from "../browser-compat-data/feature";
import { Release } from "../browser-compat-data/release";
import { browsers } from "./core-browser-set";
import { support } from "./support";
import { Browser } from "../browser-compat-data/browser";
import { Compat, defaultCompat } from "../browser-compat-data/compat";
import { isFuture, toDateString, toHighDate } from "./date-utils";

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
  const support = minSupport(statuses.map((status) => status.support));

  const keystoneDate = findKeystoneDate(
    statuses.flatMap((s) => [...s.support.values()]),
  );
  const { baseline, baseline_low_date, baseline_high_date } =
    keystoneDateToStatus(keystoneDate);

  return {
    baseline,
    baseline_low_date,
    baseline_high_date,
    support,
    toJSON: function () {
      return jsonify(this);
    },
  };
}

function calculate(compatKey: string, compat: Compat): SupportStatus {
  const f = feature(compatKey);
  const s = support(f, browsers(compat), compat);
  const keystoneDate = findKeystoneDate([...s.values()]);

  const { baseline, baseline_low_date, baseline_high_date } =
    keystoneDateToStatus(keystoneDate);

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

function keystoneDateToStatus(date: Temporal.PlainDate | null): {
  baseline: "high" | "low" | false;
  baseline_low_date: string | null;
  baseline_high_date: string | null;
} {
  let baseline: "high" | "low" | false;
  let baseline_low_date;
  let baseline_high_date;
  if (date === null || isFuture(date)) {
    baseline = false;
    baseline_low_date = null;
    baseline_high_date = null;
  } else {
    baseline = "low";
    baseline_low_date = toDateString(date);
    baseline_high_date = null;
  }

  if (baseline === "low") {
    assert(date !== null);
    const possibleHighDate = toHighDate(date);
    if (isFuture(date)) {
      baseline_high_date = null;
    } else {
      baseline = "high";
      baseline_high_date = toDateString(possibleHighDate);
    }
  }

  return { baseline, baseline_low_date, baseline_high_date };
}

function findKeystoneDate(
  releases: (Release | undefined)[],
): Temporal.PlainDate | null {
  let latestDate = null;
  for (const release of releases) {
    if (release === undefined || release.date === null) {
      return null;
    }
    if (latestDate === null) {
      latestDate = release.date;
    }
    if (Temporal.PlainDate.compare(latestDate, release.date) === -1) {
      latestDate = release.date;
    }
  }
  return latestDate;
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
