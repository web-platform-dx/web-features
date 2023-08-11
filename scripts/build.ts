import fs from 'fs';

import stringify from 'fast-json-stable-stringify';

import features from '../index.js';

const rootDir = new URL('..', import.meta.url);
const packageDir = new URL('./packages/web-features/', rootDir);

function build() {
    const json = stringify(features);
    // TODO: Validate the resulting JSON against a schema.
    const path = new URL('index.json', packageDir);
    fs.writeFileSync(path, json);
    fs.copyFileSync(new URL("LICENSE.txt", rootDir), new URL("LICENSE.txt", packageDir));
}

build();
