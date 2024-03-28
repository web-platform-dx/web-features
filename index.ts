import fs from 'fs';
import path from 'path';

import { fdir } from 'fdir';
import YAML from 'yaml';
import { FeatureData } from './types';
import { Temporal } from '@js-temporal/polyfill';

// TODO: Use npm workspaces (or similar) strategy to reference the package,
// instead of reaching into the source like this
import { BASELINE_LOW_TO_HIGH_DURATION } from "./packages/compute-baseline/src/constants"

// The longest description allowed, to avoid them growing into documentation.
const descriptionMaxLength = 280;

// Some FeatureData keys aren't (and may never) be ready for publishing.
// They're not part of the public schema (yet).
const omittables = [
    "description",
    "snapshot",
    "group"
]

function scrub(data: any) {
    for (const key of omittables) {
        delete data[key];
    }
    return data as FeatureData;
}

function* yamlEntries(root: string): Generator<[string, any]> {
    const filePaths = new fdir()
        .withBasePath()
        .filter((fp) => fp.endsWith('.yml'))
        .crawl(root)
        .sync() as string[];

    for (const fp of filePaths) {
        // The feature identifier/key is the filename without extension.
        const key = path.parse(fp).name;

        const src = fs.readFileSync(fp, { encoding: 'utf-8'});
        const data = YAML.parse(src);

        yield [key, data];
    }
}

// Load snapshots first so that snapshot identifiers can be validated while
// loading features.
const snapshots: { [key: string]: any } = {};

for (const [key, data] of yamlEntries('snapshots')) {
    // Note that the data is unused and unvalidated for now.
    snapshots[key] = data;
}

const features: { [key: string]: FeatureData } = {};

for (const [key, data] of yamlEntries('feature-group-definitions')) {
    // Compute Baseline high date from low date.
    if (data.status?.baseline_high_date) {
        throw new Error(`baseline_high_date is computed and should not be used in source YAML. Remove it from ${key}.yml.`);
    }
    if (data.status?.baseline === 'high') {
        const lowDate = Temporal.PlainDate.from(data.status.baseline_low_date);
        const highDate = lowDate.add(BASELINE_LOW_TO_HIGH_DURATION);
        data.status.baseline_high_date = String(highDate);
    }

    // Ensure description is not too long.
    if (data.description?.length > descriptionMaxLength) {
        throw new Error(`description in ${key}.yml is too long, ${data.description.length} characters. The maximum allowed length is ${descriptionMaxLength}.`)
    }

    // Ensure that only known snapshot identifiers are used.
    if (data.snapshot && !Object.hasOwn(snapshots, data.snapshot)) {
        throw new Error(`snapshot ${data.snapshot} used in ${key}.yml is not a valid snapshot. Add it to snapshots/ if needed.`);
    }

    features[key] = scrub(data);
}

export default features;
