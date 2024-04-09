import fs from 'fs';

import stringify from 'fast-json-stable-stringify';

import features from '../index.js';
import { execSync } from 'child_process';

const rootDir = new URL('..', import.meta.url);
const packageDir = new URL('./packages/web-features/', rootDir);

const filesToCopy = ["LICENSE.txt", "types.ts"];

function build() {
    const json = stringify(features);
    // TODO: Validate the resulting JSON against a schema.
    const path = new URL('index.json', packageDir);
    fs.writeFileSync(path, json);
    for (const file of filesToCopy) {
        fs.copyFileSync(new URL(file, rootDir), new URL(file, packageDir));
    }
    execSync("npm install", { cwd: "./packages/web-features",  encoding: "utf-8"});
    execSync("npm run prepare", { cwd: "./packages/web-features", encoding: "utf-8"});
}

build();
