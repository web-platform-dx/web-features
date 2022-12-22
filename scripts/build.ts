import fs from 'fs';

import stringify from 'fast-json-stable-stringify';

import features from '../index';

function build() {
    const json = stringify(features);
    // TODO: Validate the resulting JSON against a schema.
    fs.writeFileSync('index.json', json);
}

build();
