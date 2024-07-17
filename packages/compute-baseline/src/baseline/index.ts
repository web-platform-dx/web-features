import { Temporal } from "@js-temporal/polyfill";
import { Browser } from "../browser-compat-data/browser.js";
import { Compat, defaultCompat } from "../browser-compat-data/compat.js";
import { feature } from "../browser-compat-data/feature.js";
import { browsers } from "./core-browser-set.js";
import {
  parseRangedDateString,
  toHighDate,
  toRangedDateString,
} from "./date-utils.js";
import {
  compareInitialSupport,
  InitialSupport,
  support,
  SupportMap,
} from "./support.js";

// Include this in the public API
export { parseRangedDateString } from "./date-utils.js";

interface Logger {
  debug?: typeof console.debug;
  info?: typeof console.info;
  log?: typeof console.log;
  warn?: typeof console.warn;
}

export let logger: Logger | undefined = process.env["DEBUG_COMPUTE_BASELINE"]
  ? console
  : undefined;

export function setLogger(logFacility: Logger | undefined) {
  logger = logFacility;
}

// Number of months after Baseline low that Baseline high happens. Keep in sync with definition:
// https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md#wider-support-high-status
export const BASELINE_LOW_TO_HIGH_DURATION = Temporal.Duration.from({
  months: 30,
});

type BaselineStatus = "low" | "high" | false;
type BaselineDate = string | null;

interface SupportDetails {
  compatKey?: string;
  baseline: BaselineStatus;
  baseline_low_date: BaselineDate;
  baseline_high_date: BaselineDate;
  discouraged: boolean;
  support: Map<Browser, InitialSupport | undefined>;
  toJSON: () => string;
}

// TODO: Use a type from `web-features` directly, instead of approximating it here
interface SupportStatus {
  baseline: "low" | "high" | false;
  baseline_low_date: string;
  baseline_high_date?: string;
  support: Record<string, string>;
}

/**
 * Calculate a Baseline status for specific browser compat data keys within a
 * web-features feature, in the style of a web-feature's `status` key. Use this
 * method to calculate fine-grained support statuses. This is the only method
 * approved to compute Baseline statuses not otherwise published in the
 * `web-features` package.
 *
 * For example, suppose you want to show a Baseline status for a specific method
 * in a feature, which might've been supported earlier or later than the broader
 * feature overall. Then you'd call `getStatus('example-feature',
 * 'api.ExampleManager.doExample')`.
 */
export function getStatus(
  featureId: string,
  compatKey: string,
  compat: Compat = defaultCompat,
): SupportStatus {
  // TODO: actually check that featureId is a valid feature
  // TODO: actually check that compatKey is tagged as featureId in BCD _or_ listed in web-features
  return JSON.parse(
    computeBaseline(
      { compatKeys: [compatKey], checkAncestors: true },
      compat,
    ).toJSON(),
  );
}

/**
 * Given a set of compat keys, compute the aggregate Baseline support ("high",
 * "low" or false, dates, and releases) for those keys.
 */
export function computeBaseline(
  featureSelector: {
    compatKeys: [string, ...string[]];
    checkAncestors?: boolean;
  },
  compat: Compat = defaultCompat,
): SupportDetails {
  // A cutoff date approximating "now" is needed to determine when a feature has
  // entered Baseline high. We use BCD's __meta.timestamp for this, but any
  // "clock" based on the state of the tree that ticks frequently would work.
  const timestamp: string = (compat.data as any).__meta.timestamp;
  const cutoffDate = Temporal.Instant.from(timestamp)
    .toZonedDateTimeISO("UTC")
    .toPlainDate();

  const { compatKeys } = featureSelector;
  const keys = featureSelector.checkAncestors
    ? compatKeys.flatMap((key) => withAncestors(key, compat))
    : compatKeys;

  const statuses = keys.map((key) => calculate(key, compat));
  const support = collateSupport(statuses.map((status) => status.support));

  const keystoneDate = findKeystoneDate(
    statuses.flatMap((s) => [...s.support.values()]),
  );
  const discouraged = statuses.some((s) => s.discouraged);
  const { baseline, baseline_low_date, baseline_high_date } =
    keystoneDateToStatus(keystoneDate, cutoffDate, discouraged);

  return {
    baseline,
    baseline_low_date,
    baseline_high_date,
    discouraged,
    support,
    toJSON: function () {
      return jsonify(this);
    },
  };
}

/**
 * Compute the Baseline support ("high", "low" or false, dates, and releases)
 * for a single compat key.
 */
function calculate(compatKey: string, compat: Compat) {
  const f = feature(compatKey);

  return {
    discouraged: f.deprecated ?? false,
    support: support(f, browsers(compat)),
  };
}

/**
 * Given a compat key, get the key and any of its ancestor features.
 *
 * For example, given the key `"html.elements.a.href"`, return
 * `["html.elements.a", "html.elements.a.href"]`.
 */
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

/**
 * Collate several support summaries, taking the most-recent release for each
 * browser across all of the summaries.
 */
function collateSupport(supports: SupportMap[]): SupportMap {
  const collated = new Map<Browser, (InitialSupport | undefined)[]>();

  for (const support of supports) {
    for (const [browser, initialSupport] of support) {
      collated.set(browser, [...(collated.get(browser) ?? []), initialSupport]);
    }
  }

  const support: SupportMap = new Map();
  for (const [browser, initialSupports] of collated) {
    if (initialSupports.includes(undefined)) {
      support.set(browser, undefined);
    } else {
      support.set(
        browser,
        (initialSupports as InitialSupport[])
          .sort(compareInitialSupport)
          .at(-1),
      );
    }
  }
  return support;
}

/**
 * Given several dates, find the most-recent date and determine the
 * corresponding Baseline status and high and low dates.
 */
export function keystoneDateToStatus(
  dateSpec: string | null,
  cutoffDate: Temporal.PlainDate,
  discouraged: boolean,
): {
  baseline: BaselineStatus;
  baseline_low_date: BaselineDate;
  baseline_high_date: BaselineDate;
} {
  if (dateSpec == null || discouraged) {
    return {
      baseline: false,
      baseline_low_date: null,
      baseline_high_date: null,
    };
  }

  const [date, ranged] = parseRangedDateString(dateSpec);

  let baseline: BaselineStatus = "low";
  let baseline_low_date: BaselineDate = toRangedDateString(date, ranged);
  let baseline_high_date: BaselineDate = null;

  const possibleHighDate = toHighDate(date);
  if (Temporal.PlainDate.compare(possibleHighDate, cutoffDate) <= 0) {
    baseline = "high";
    baseline_high_date = toRangedDateString(possibleHighDate, ranged);
  }

  return { baseline, baseline_low_date, baseline_high_date };
}

/**
 * Given one or more releases, return the most-recent release date. If a release
 * is `undefined` or the release date is `null`, then return `null`, since the
 * feature is not Baseline and there is no keystone date.
 */
function findKeystoneDate(
  support: (InitialSupport | undefined)[],
): string | null {
  if (support.includes(undefined) || support.length === 0) {
    return null;
  }

  const initialSupports = support as InitialSupport[];
  if (initialSupports.some((i) => i.release.date === null)) {
    return null;
  }
  const keystone = initialSupports
    .sort((i1, i2) => {
      if (
        Temporal.PlainDate.compare(
          i1.release.date as Temporal.PlainDate,
          i2.release.date as Temporal.PlainDate,
        ) === 0
      ) {
        if (i1.ranged && !i2.ranged) {
          return -1;
        }
        if (!i1.ranged && i2.ranged) {
          return 1;
        }
        return 0;
      }
      return Temporal.PlainDate.compare(
        i1.release.date as Temporal.PlainDate,
        i2.release.date as Temporal.PlainDate,
      );
    })
    .at(-1) as InitialSupport;

  if (keystone.ranged) {
    return `≤${keystone.release.date}`;
  }
  return `${keystone.release.date}`;
}

function jsonify(status: SupportDetails): string {
  const { baseline_low_date, baseline_high_date } = status;
  const support: Record<string, string> = {};

  for (const [browser, initialSupport] of status.support.entries()) {
    if (initialSupport !== undefined) {
      support[browser.id] = initialSupport.text;
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
