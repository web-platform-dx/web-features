import assert from "node:assert/strict";

import webSpecs from 'web-specs' assert { type: 'json' };

import features from '../index.js';

const specUrls = webSpecs.map(spec => new URL(spec.nightly.url));

function isOK(url: URL) {
    for (const specUrl of specUrls) {
        if (specUrl.protocol !== url.protocol || specUrl.origin !== url.origin) {
            continue;
        }
        if (url.pathname.startsWith(specUrl.pathname)) {
            return true;
        }
    }
    return false;
}

function testIsOK() {
    assert.ok(isOK(new URL("https://tc39.es/ecma262/multipage/")));
    assert.ok(isOK(new URL("https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.at")));
    assert.ok(!isOK(new URL("https://typo.csswg.org/css-anchor-position-1/#anchoring")));
};
testIsOK();

let checked = 0;
let errors = 0;

for (const [id, data] of Object.entries(features)) {
    const url = new URL(data.spec);
    if (!isOK(url)) {
        console.error(`URL for ${id} not in web-specs: ${url.toString()}`);
        errors++;
    }
    checked++;
}

if (errors) {
    console.log(`\n${checked} features checked, found ${errors} error(s)`);
    process.exit(1);
} else {
    console.log(`${checked} features checked, no errors`);
}
