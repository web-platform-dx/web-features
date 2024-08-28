export interface WebFeaturesData {
    /** Browsers and browser release data */
    browsers: { [key in BrowserIdentifier]: BrowserData };
    /** Feature identifiers and data */
    features: { [key: string]: FeatureData };
    /** Group identifiers and data */
    groups: { [key: string]: GroupData };
    /** Snapshot identifiers and data */
    snapshots: { [key: string]: SnapshotData };
}


/** Browser information */
export interface BrowserData {
    /** The name of the browser, as in "Edge" or "Safari on iOS" */
    name: string;
    /** The browser's releases */
    releases: Release[];
}

/** Browser release information */
export interface Release {
    /** The version string, as in "10" or "17.1" */
    version: string;
    /** The release date, as in "2023-12-11" */
    date: string;
}

export interface FeatureData {
    /** Short name */
    name: string;
    /** Short description of the feature, as a plain text string */
    description: string;
    /** Short description of the feature, as an HTML string */
    description_html: string;
    /** Specification */
    spec: specification_url | [specification_url, specification_url, ...specification_url[]];
    /** Group identifier */
    group?: string | [string, string, ...string[]];
    /** Snapshot identifier */
    snapshot?: string | [string, string, ...string[]];
    /** caniuse.com identifier */
    caniuse?: string | [string, string, ...string[]];
    /** Whether a feature is considered a "baseline" web platform feature and when it achieved that status */
    status: SupportStatus;
    /** Sources of support data for this feature */
    compat_features?: string[];
}

type BrowserIdentifier = "chrome" | "chrome_android" | "edge" | "firefox" | "firefox_android" | "safari" | "safari_ios";

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
    by_compat_key?: Record<string, Status>
}

/** Specification URL
 * @format uri
*/
type specification_url = string;

export interface GroupData {
    /** Short name */
    name: string;
    /** Identifier of parent group */
    parent?: string;
}

export interface SnapshotData {
    /** Short name */
    name: string;
    /** Specification */
    spec: specification_url;
}
