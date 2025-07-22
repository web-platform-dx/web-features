/**
 * The top-level web-features data package
 */
export interface WebFeaturesData {
  /**
   * Browsers and browser release data
   */
  browsers: Browsers;
  /**
   * Feature identifiers and data
   */
  features: { [key: string]: FeatureData };
  /**
   * Group identifiers and data
   */
  groups: { [key: string]: GroupData };
  /**
   * Snapshot identifiers and data
   */
  snapshots?: { [key: string]: SnapshotData };
}

/**
 * Browsers and browser release data
 */
export interface Browsers {
  chrome: BrowserData;
  chrome_android: BrowserData;
  edge: BrowserData;
  firefox: BrowserData;
  firefox_android: BrowserData;
  safari: BrowserData;
  safari_ios: BrowserData;
}

/**
 * Browser information
 */
export interface BrowserData {
  /**
   * The name of the browser, as in "Edge" or "Safari on iOS"
   */
  name: string;
  releases: Release[];
}

/**
 * Browser release information
 */
export interface Release {
  /**
   * The release date, as in "2023-12-11"
   */
  date: string;
  /**
   * The version string, as in "10" or "17.1"
   */
  version: string;
}

/**
 * A feature data entry
 *
 * A feature has permanently moved to exactly one other ID
 *
 * A feature has split into two or more other features
 */
export interface FeatureData {
  /**
   * caniuse.com identifier(s)
   */
  caniuse?: string[] | string;
  /**
   * Sources of support data for this feature
   */
  compat_features?: string[];
  /**
   * Short description of the feature, as a plain text string
   */
  description?: string;
  /**
   * Short description of the feature, as an HTML string
   */
  description_html?: string;
  /**
   * Whether developers are formally discouraged from using this feature
   */
  discouraged?: Discouraged;
  /**
   * Group identifier(s)
   */
  group?: string[] | string;
  kind: Kind;
  /**
   * Short name
   */
  name?: string;
  /**
   * Snapshot identifier(s)
   */
  snapshot?: string[] | string;
  /**
   * Specification URL(s)
   */
  spec?: string[] | string;
  /**
   * Whether a feature is considered a "Baseline" web platform feature and when it achieved
   * that status
   */
  status?: StatusHeadline;
  /**
   * The new ID for this feature
   */
  redirect_target?: string;
  /**
   * The new IDs for this feature
   */
  redirect_targets?: string[];
}

/**
 * Whether developers are formally discouraged from using this feature
 */
export interface Discouraged {
  /**
   * Links to a formal discouragement notice, such as specification text, intent-to-unship,
   * etc.
   */
  according_to: string[];
  /**
   * IDs for features that substitute some or all of this feature's utility
   */
  alternatives?: string[];
}

export type Kind = "feature" | "moved" | "split";

/**
 * Whether a feature is considered a "Baseline" web platform feature and when it achieved
 * that status
 */
export interface StatusHeadline {
  /**
   * Whether the feature is Baseline (low substatus), Baseline (high substatus), or not (false)
   */
  baseline: boolean | BaselineEnum;
  /**
   * Date the feature achieved Baseline high status
   */
  baseline_high_date?: string;
  /**
   * Date the feature achieved Baseline low status
   */
  baseline_low_date?: string;
  /**
   * Statuses for each key in the feature's compat_features list, if applicable. Not available
   * to the npm release of web-features.
   */
  by_compat_key?: { [key: string]: Status };
  /**
   * Browser versions that most-recently introduced the feature
   */
  support: Support;
}

export type BaselineEnum = "high" | "low";

export interface Status {
  /**
   * Whether the feature is Baseline (low substatus), Baseline (high substatus), or not (false)
   */
  baseline: boolean | BaselineEnum;
  /**
   * Date the feature achieved Baseline high status
   */
  baseline_high_date?: string;
  /**
   * Date the feature achieved Baseline low status
   */
  baseline_low_date?: string;
  /**
   * Browser versions that most-recently introduced the feature
   */
  support: Support;
  [property: string]: any;
}

/**
 * Browser versions that most-recently introduced the feature
 */
export interface Support {
  chrome?: string;
  chrome_android?: string;
  edge?: string;
  firefox?: string;
  firefox_android?: string;
  safari?: string;
  safari_ios?: string;
}

export interface GroupData {
  /**
   * Short name
   */
  name: string;
  /**
   * Identifier of parent group
   */
  parent?: string;
}

export interface SnapshotData {
  /**
   * Short name
   */
  name: string;
  /**
   * Specification
   */
  spec: string;
}
