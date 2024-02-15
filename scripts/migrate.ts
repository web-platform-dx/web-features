import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fdir } from 'fdir';
import features from '../index.js';

const BCD_PATH = '/Users/foolip/mdn/browser-compat-data';

// Map from api.CoolThing.something to cool-thing
const bcdToFeature = new Map();

// Set of the first part of the BCD path encountered.
const bcdDirs = new Set();

for (const [feature, {compat_features}] of Object.entries(features)) {
    if (!compat_features) {
        continue;
    }
    for (const key of compat_features) {
        assert(!bcdToFeature.has(key));
        bcdToFeature.set(key, feature);
        bcdDirs.add(key.split('.')[0]);
    }
}

const bcdJsons = new fdir()
    .withBasePath()
    .filter((fp) => {
        const dir = path.relative(BCD_PATH, fp).split(path.sep)[0];
        return bcdDirs.has(dir);
    })
    .filter((fp) => fp.endsWith('.json'))
    .crawl(BCD_PATH)
    .sync();

const lookup = (root, key) => {
    const parts = key.split('.');
    let node = root;
    for (const part of parts) {
        if (Object.hasOwn(node, part)) {
            node = node[part];
            //console.log(`${part} found`);
        } else {
            //console.log(`${part} not found`);
            return undefined;
        }
    }
    return node;
};

for (const fp of bcdJsons) {
    const src = fs.readFileSync(fp, { encoding: 'utf-8' });
    const data = JSON.parse(src);
    let updated = false;
    for (const [key, feature] of bcdToFeature.entries()) {
        const node = lookup(data, key);
        if (!node || !node.__compat) {
            continue;
        }
        //console.log(`${key} found in ${fp}`);
        const compat = node.__compat;
        //assert(!compat.tags, 'tags already present');
        compat.tags = [`web-features:${feature}`];
        updated = true;
        bcdToFeature.delete(key);
    }
    if (updated) {
        const src = JSON.stringify(data, null, '  ') + '\n';
        fs.writeFileSync(fp, src, { encoding: 'utf-8' })
    }
}

for (const [key, feature] of bcdToFeature) {
    console.warn('Not migrated:', feature, key);
}
