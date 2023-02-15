import fs from 'fs';
import path from 'path';

import { fdir } from 'fdir';
import YAML from 'yaml';

interface FeatureData {
    spec: string,
    caniuse?: string
    status?: SupportStatus
}

type browserIdentifier = "chrome" | "firefox" | "safari";

interface SupportStatus {
    is_basline: boolean, since?: string, support?: {[K in browserIdentifier]?: string}
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
    features[key] = data;
}

export default features;
