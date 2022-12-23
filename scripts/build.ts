import fs from 'fs';

import stringify from 'fast-json-stable-stringify';

import features from '../index.js';

function build() {
    const json = stringify(features);
    // TODO: Validate the resulting JSON against a schema.
    const path = new URL('../packages/web-features/index.json', import.meta.url);
    fs.writeFileSync(path, json);
}

build();
