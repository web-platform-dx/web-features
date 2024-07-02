export interface WebFeaturesData {
    /** Feature identifiers and data */
    features: { [key: string]: FeatureData };
    /** Group identifiers and data */
    groups: { [key: string]: GroupData };
    /** Snapshot identifiers and data */
    snapshots: { [key: string]: SnapshotData };
}

export interface FeatureData {
    /** Short name */
    name: string;
    /** Short description of the feature, as a plain text string */
    description: string;
    /** Short description of the feature, as an HTML string */
    description_html: string;
    /** Alias identifier */
    alias?: string | [string, string, ...string[]];
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

type browserIdentifier = "chrome" | "chrome_android" | "edge" | "firefox" | "firefox_android" | "safari" | "safari_ios";

type BaselineHighLow = "high" | "low";

interface SupportStatus {
    /** Whether the feature is Baseline (low substatus), Baseline (high substatus), or not (false) */
    baseline: BaselineHighLow | false;
    /** Date the feature achieved Baseline low status */
    baseline_low_date?: string;
    /** Date the feature achieved Baseline high status */
    baseline_high_date?: string;
    /** Browser versions that most-recently introduced the feature */
    support: {
        [K in browserIdentifier]?: string;
    };
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
