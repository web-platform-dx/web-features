import fs from 'fs';
import path from 'path';

import { fdir } from 'fdir';
import YAML from 'yaml';

interface FeatureData {
    spec: string,
    caniuse?: string,
    "constituent-features"?: Array<{source: string, query: string}>
}

// Some FeatureData keys aren't (and may never) be ready for publishing.
// They're not part of the public schema (yet).
// They'll be removed.
const omittables = [
    "constituent-features"
]

function scrub(data: FeatureData) {
    for (const key of omittables) {
        delete data[key];
    }
    return data;
}

const filePaths = new fdir()
    .withBasePath()
    .filter((fp) => !fp.endsWith(".map.yml") && fp.endsWith('.yml'))
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
