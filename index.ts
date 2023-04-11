import fs from 'fs';
import path from 'path';

import { fdir } from 'fdir';
import YAML from 'yaml';

/** Web platform feature */
export interface FeatureData {
    /** Specification URL
     * @format uri
    */
    spec: string;
    /** caniuse.com identifier */
    caniuse?: string;
    /** Whether a feature is considered a "baseline" web platform feature and when it achieved that status */
    status?: SupportStatus;
    /** Sources of support data for this feature */
    compat_features?: string[];
    /** Usage stats */
    usage_stats?: usage_stats_url | [usage_stats_url, usage_stats_url, ...usage_stats_url[]];  // A single URL or an array of two or more
}

type browserIdentifier = "chrome" | "firefox" | "safari";

interface SupportStatus {
    /** Whether the feature achieved baseline status */
    is_baseline: boolean;
    /** Date the feature achieved baseline status */
    since?: string;
    /** Browser versions that most-recently introduced the feature */
    support?: {[K in browserIdentifier]?: string};
}

/** Usage stats URL
 * @format uri
*/
type usage_stats_url = string;

// Some FeatureData keys aren't (and may never) be ready for publishing.
// They're not part of the public schema (yet).
// They'll be removed.
const omittables = [
    // "compat_features"
]

function scrub(data: FeatureData) {
    for (const key of omittables) {
        delete data[key];
    }
    return data;
}

const filePaths = new fdir()
    .withBasePath()
    .filter((fp) => fp.endsWith('.yml'))
    .crawl('feature-group-definitions')
    .sync() as string[];

const features: { [key: string]: FeatureData } = {};

for (const fp of filePaths) {
    // The feature identifier/key is the filename without extension.
    const key = path.parse(fp).name;

    const src = fs.readFileSync(fp, { encoding: 'utf-8'});
    const data = YAML.parse(src);
    features[key] = scrub(data);
}

export default features;
