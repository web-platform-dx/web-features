/** Web platform feature */

export interface FeatureData {
    /** Short name */
    name: string;
    /** Alias identifier */
    alias?: string | [string, string, ...string[]];
    /** Whether a feature is archived.
     *
     * A feature that has been widely available and used for more than 10 years
     * may be archived if it is no longer thought of as a distinct feature, but
     * part of the foundations of the platform. Archived features are typically
     * not valuable to show in a list of features, or in search results. */
    archived?: true;
    /** Specification */
    spec: specification_url | [specification_url, specification_url, ...specification_url[]];
    /** caniuse.com identifier */
    caniuse?: string | [string, string, ...string[]];
    /** Whether a feature is considered a "baseline" web platform feature and when it achieved that status */
    status?: SupportStatus;
    /** Sources of support data for this feature */
    compat_features?: string[];
    /** Usage stats */
    usage_stats?: usage_stats_url | [usage_stats_url, usage_stats_url, ...usage_stats_url[]]; // A single URL or an array of two or more
}

type browserIdentifier = "chrome" | "chrome_android" | "edge" | "firefox" | "firefox_android" | "safari" | "safari_ios";

type BaselineHighLow = "high" | "low";

interface SupportStatus {
    /** Whether the feature is Baseline (low substatus), Baseline (high substatus), or not (false) */
    baseline?: BaselineHighLow | false;
    /** Date the feature achieved Baseline low status */
    baseline_low_date?: string;
    /** Date the feature achieved Baseline high status */
    baseline_high_date?: string;
    /** Browser versions that most-recently introduced the feature */
    support?: {
        [K in browserIdentifier]?: string;
    };
}

/** Specification URL
 * @format uri
*/
type specification_url = string;

/** Usage stats URL
 * @format uri
*/
type usage_stats_url = string;
