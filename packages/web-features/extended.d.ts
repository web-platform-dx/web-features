/** Browser information */
interface BrowserData {
  /** The name of the browser, as in "Edge" or "Safari on iOS" */
  name: string;
  /** The browser's releases */
  releases: Release[];
}
/** Browser release information */
interface Release {
  /** The version string, as in "10" or "17.1" */
  version: string;
  /** The release date, as in "2023-12-11" */
  date: string;
}
interface FeatureData {
  /** Short name */
  name: string;
  /** Short description of the feature, as a plain text string */
  description: string;
  /** Short description of the feature, as an HTML string */
  description_html: string;
  /** Specification URL(s) */
  spec: string | [string, string, ...string[]];
  /** Group identifier(s) */
  group?: string | [string, string, ...string[]];
  /** Snapshot identifier(s) */
  snapshot?: string | [string, string, ...string[]];
  /** caniuse.com identifier(s) */
  caniuse?: string | [string, string, ...string[]];
  /** Whether a feature is considered a "baseline" web platform feature and when it achieved that status */
  status: SupportStatus;
  /** Sources of support data for this feature */
  compat_features?: string[];
  /** Whether developers are formally discouraged from using this feature */
  discouraged?: Discouraged;
}
type BrowserIdentifier =
  | "chrome"
  | "chrome_android"
  | "edge"
  | "firefox"
  | "firefox_android"
  | "safari"
  | "safari_ios";
type BaselineHighLow = "high" | "low";
interface Status {
  /** Whether the feature is Baseline (low substatus), Baseline (high substatus), or not (false) */
  baseline: BaselineHighLow | false;
  /** Date the feature achieved Baseline low status */
  baseline_low_date?: string;
  /** Date the feature achieved Baseline high status */
  baseline_high_date?: string;
  /** Browser versions that most-recently introduced the feature */
  support: {
    [K in BrowserIdentifier]?: string;
  };
}
interface SupportStatus extends Status {
  /** Statuses for each key in the feature's compat_features list, if applicable. Not available to the npm release of web-features. */
  by_compat_key?: Record<string, Status>;
}
interface Discouraged {
  /** Links to a formal discouragement notice, such as specification text, intent-to-unship, etc. */
  according_to: string[];
  /** IDs for features that substitute some or all of this feature's utility */
  alternatives?: string[];
}
interface GroupData {
  /** Short name */
  name: string;
  /** Identifier of parent group */
  parent?: string;
}
interface SnapshotData {
  /** Short name */
  name: string;
  /** Specification */
  spec: string;
}

declare const browsers: {
  chrome: BrowserData;
  chrome_android: BrowserData;
  edge: BrowserData;
  firefox: BrowserData;
  firefox_android: BrowserData;
  safari: BrowserData;
  safari_ios: BrowserData;
};
declare const features: {
  [key: string]: FeatureData;
};
declare const groups: {
  [key: string]: GroupData;
};
declare const snapshots: {
  [key: string]: SnapshotData;
};
/**
 * Get the baseline status for a specific browser compatibility key.
 * @param featureId - Optional feature ID to search within (improves performance if known)
 * @param bcdKey - The browser compatibility data key (e.g., "api.HTMLElement.focus")
 * @returns The baseline status object for the key, or undefined if not found
 */
declare function getStatus(
  featureId: string | undefined,
  bcdKey: string,
): Status | undefined;

export { browsers, features, getStatus, groups, snapshots };
