import assert from "node:assert/strict";

import webSpecs from 'web-specs' assert { type: 'json' };

import features from '../index.js';

const specUrls: URL[] = webSpecs.flatMap(spec => {
    return [
        new URL(spec.nightly.url),
        ...(spec.nightly.pages ?? []).map(page => new URL(page))
    ]
});

type allowlistItem = [url: string, message: string];
const defaultAllowlist: allowlistItem[] = [
    // [
    //     "https://example.com/spec/",
    //     "This spec is allowed because…. Remove this exception when https://example.com/org/repo/pull/1234 merges."
    // ]
    [
        "https://aomediacodec.github.io/av1-avif/",
        "This spec is allowed because AVIF is supported in Chrome, Firefox and Safari. Remove this exception when https://github.com/w3c/browser-specs/issues/1088 is resolved."
    ]
];

function isOK(url: URL, allowlist: allowlistItem[] = defaultAllowlist) {
    for (const specUrl of specUrls) {
        if (specUrl.origin === url.origin && specUrl.pathname === url.pathname) {
            // that is, specUrl and url are the same, with the exception of the hash or query (`search`) string
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
    const specs = Array.isArray(data.spec) ? data.spec : [data.spec];
    for (const spec of specs) {
        const url = new URL(spec);
        if (!isOK(url)) {
            console.error(`URL for ${id} not in web-specs: ${url.toString()}`);
            errors++;
        }
        checked++;
    }
}

if (errors) {
    console.log(`\n${checked} features checked, found ${errors} error(s)`);
    process.exit(1);
} else {
    console.log(`${checked} features checked, no errors`);
}
