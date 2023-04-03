import fs from 'fs';
import path from 'path';

import { fdir } from 'fdir';
import stringify from "fast-json-stable-stringify";
import YAML from 'yaml';

import { lockout } from './lock.js';

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
    "compat_features"
]

function scrub(data: FeatureData) {
    // TODO: there's no structuredClone in Node 16, so we'll do the next best thing
    const scrubbed = JSON.parse(stringify(data));
    for (const key of omittables) {
        delete scrubbed[key];
    }
    return scrubbed;
}

const filePaths = new fdir()
    .withBasePath()
    .filter((fp) => fp.endsWith('.yml') && !fp.endsWith('.lockfile.yml'))
    .crawl('feature-group-definitions')
    .sync() as string[];

const features: { [key: string]: FeatureData } = {};

for (const fp of filePaths) {
    // The feature identifier/key is the filename without extension.
    const key = path.parse(fp).name;

    const src = fs.readFileSync(fp, { encoding: 'utf-8'});
    const data = YAML.parse(src);
    const resolved = lockout(fp, data);

    features[key] = scrub(resolved);

    // Clean out lockfiles that are mere copies of the original file
    const lockFp = path.join(path.dirname(fp), `${key}.lockfile.yml`);
    if (stringify(data) === stringify(resolved)) {
        fs.rmSync(lockFp);
    }
}

export default features;
