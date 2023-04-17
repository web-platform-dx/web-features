import assert from "node:assert/strict";

import webSpecs from 'web-specs' assert { type: 'json' };

import features from '../index.js';

const specUrls = webSpecs.map(spec => new URL(spec.nightly.url));

type allowlistItem = [url: string, message: string];
const defaultAllowlist: allowlistItem[] = [
    [
        "https://wicg.github.io/navigation-api/",
        "This spec is moving to WHATWG HTML. Remove this exception when https://github.com/whatwg/html/pull/8502 merges."
    ],
];

function isOK(url: URL, allowlist: allowlistItem[] = defaultAllowlist) {
    for (const specUrl of specUrls) {
        if (specUrl.origin !== url.origin) {
            continue;
        }
        if (specUrl.pathname === url.pathname) {
            // that is, specUrl and url are the same, with the exception of the hash or query (`search`) string
            return true;
        }
        if (specUrl.pathname.includes("/multipage") && url.pathname.startsWith(specUrl.pathname)) {
            return true;
        }
    }

    for (const [specUrl, message] of allowlist) {
        if (specUrl === url.toString()) {
            console.warn(`${specUrl}: ${message}`);
            return true;
        }
    }
    return false;
}

function testIsOK() {
    assert.ok(isOK(new URL("https://tc39.es/ecma262/multipage/")));
    assert.ok(isOK(new URL("https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.at")));
    assert.ok(!isOK(new URL("https://typo.csswg.org/css-anchor-position-1/#anchoring")));
    assert.ok(!isOK(new URL("https://w3c.github.io/gamepad/extensions.htmltypo")))
    // Skip noisy test
    // assert.ok(isOK(new URL("https://www.example.com/"), [["https://www.example.com/", "Remove this exception when…"]]));
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
