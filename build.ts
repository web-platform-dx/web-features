import fs from 'fs/promises';
import path from 'path';

import { fdir } from 'fdir';
import stringify from 'fast-json-stable-stringify';
import YAML from 'yaml';

async function build() {
    const filePaths = await new fdir()
    .withBasePath()
    .filter((fp) => fp.endsWith('.yml'))
    .crawl('feature-group-definitions')
    .withPromise() as string[];

    const features: { [key: string]: object } = {};

    for (const fp of filePaths) {
        // The feature identifier/key is the filename without extension.
        const key = path.parse(fp).name;

        const src = await fs.readFile(fp, { encoding: 'utf-8'});
        const data = YAML.parse(src);
        features[key] = data;
    }

    // TODO: Validate the resulting JSON against a schema.
    const json = stringify(features, );
    fs.writeFile('web-features.json', json);
}

build();
