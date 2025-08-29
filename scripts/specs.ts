import assert from "node:assert/strict";

import webSpecs from 'web-specs' with { type: 'json' };

import { features } from '../index.js';

// Specs needs to be in "good standing". Nightly URLs are used if available,
// otherwise the snapshot/versioned URL is used. See browser-specs/web-specs
// docs for more details:
// https://github.com/w3c/browser-specs/blob/main/README.md#standing
// https://github.com/w3c/browser-specs/blob/main/README.md#nightly
// https://github.com/w3c/browser-specs/blob/main/README.md#url
const specUrls: URL[] = webSpecs
    .filter((spec) => spec.standing === 'good')
    .flatMap(spec => {
        return [
            new URL(spec.nightly?.url ?? spec.url),
            ...(spec.nightly?.pages ?? []).map(page => new URL(page))
        ]
    });

type allowlistItem = [url: string, message: string];
const defaultAllowlist: allowlistItem[] = [
    // [
    //     "https://example.com/spec/",
    //     "Allowed because…. Remove this exception when https://example.com/org/repo/pull/1234 merges."
    // ]
    [
        "https://wicg.github.io/controls-list/",
        "Allowed because it's shipped in Chrome. Remove this exception if https://github.com/whatwg/html/pull/6715 is merged."
    ],
    [
        "https://www.w3.org/TR/webnn/",
        "Allowed because this URL actually serves the same content as the Editor Draft URL, and because the ED URL is a bit verbose. See https://github.com/mdn/browser-compat-data/pull/22569#issuecomment-1992632118."
    ],
    [
        "https://github.com/WebAssembly/spec/blob/main/proposals/bulk-memory-operations/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/extended-const/blob/main/proposals/extended-const/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/multi-memory/blob/main/proposals/multi-memory/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/spec/blob/main/proposals/multi-value/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/spec/blob/main/proposals/nontrapping-float-to-int-conversion/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/spec/blob/main/proposals/reference-types/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/spec/blob/main/proposals/sign-extension-ops/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/relaxed-simd/blob/main/proposals/relaxed-simd/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/tail-call/blob/main/proposals/tail-call/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/threads/blob/main/proposals/threads/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/function-references/blob/main/proposals/function-references/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/js-string-builtins/blob/main/proposals/js-string-builtins/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/memory64/blob/main/proposals/memory64/Overview.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/legacy/Exceptions.md",
        "Allowed because there is no other specification to link to."
    ],
    [
        "https://immersive-web.github.io/webvr/spec/1.1/",
        "Allowed because this is the legacy spec that defines WebVR."
    ],
    [
        "https://github.com/tc39/proposal-import-attributes/tree/abca60286360b47f9a6be25a28f489c2cb157beb",
        "Allowed because import assertions were replaced in-place by import attributes. Remove this exception when javascript.statements.import.import_assertions is dropped from BCD in June 2026."
    ],
    [
        "https://open-ui.org/components/customizableselect/",
        "Allowed because customizable select doesn't have a spec URL yet. And even when it does, it will be defined in multiple HTML, CSS, and ARIA specs. This OpenUI explainer is the only central place that currently defines the component. Remove this exception when customizable select has one or more spec URLs. See: #10557, #10586, #10629, #10633, and #10670 at github.com/whatwg/html/, #10691, #10865, #10936, and #10986 at github.com/w3c/csswg-drafts/, #2369, #2344, and #2360 at github.com/w3c/aria/, and #528 at github.com/w3c/html-aria"
    ],
    [
        "https://www.w3.org/TR/DOM-Level-2-Style/",
        "Allowed because the css-object-model-discouraged feature points to it."
    ],
    [
        "https://w3c.github.io/editing/docs/execCommand/",
        "Allowed because the execCommand feature points to it, to inform users that the feature is obsolete. The spec exists in a draft state only and will never move out of draft. It serves as a reference."
    ],
    [
        "https://github.com/tc39/proposal-regexp-legacy-features",
        "Allowed because it's the most spec-like thing that exists for discouraged RegExp static properties. Remove when https://github.com/tc39/ecma262/issues/137 is resolved."
    ],
    [
        "https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/DocumentSubtitle/explainer.md",
        "Allowed because this is where the application-title meta tag is spec'd at the moment. Remove when https://github.com/whatwg/html/issues/8909 is fixed."
    ],
    [
        "https://www.w3.org/TR/2018/SPSD-html5-20180327/embedded-content-0.html#synchronising-multiple-media-elements",
        "Allowed for the mediacontroller feature. This is the superseded HTML5 spec that still contains MediaController."
    ],
    [
        "https://github.com/whatwg/fetch/pull/1647",
        "This is where fetchLater() is in the process of being spec'd. Once the PR merges, change the spec url in fetchlater.yml, and remove this exception."
    ],
    [
        "https://wicg.github.io/private-network-access/",
        "Allowed for private-network-access feature. Feature and spec succeeded by local-network-access."
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


/**
 * Print an array of potential spec URLs.
 */
function suggestSpecs(bad: URL): void {
    const searchBy = bad.pathname.replaceAll("/", "");
    const suggestions = specUrls.filter((specUrl) => specUrl.toString().includes(searchBy)).map(u => `- ${u}`);
    if (suggestions.length > 0) {
        console.warn("Did you mean one of these?");
        console.warn(`${suggestions.join('\n')}`);
        console.warn();
    }
}

let checkedFeatures = 0;
let checkedSpecs = 0;
let errors = 0;

// Ensure every exception in defaultAllowlist is needed
for (const [allowedUrl, message] of defaultAllowlist) {
    if (isOK(new URL(allowedUrl), [])) {
        console.error(`${allowedUrl}: ${message}`);
        console.error(`${allowedUrl} is now known to web-specs.`);
        errors++;
    }
}

for (const [id, data] of Object.entries(features)) {
    const specs = Array.isArray(data.spec) ? data.spec : [data.spec];
    for (const spec of specs) {
        let url: URL;
        try {
            url = new URL(spec);
        } catch (error) {
            console.error(`Invalid URL "${spec}" found in spec for "${data.name}"`);
            errors++;
        }
        if (url && !isOK(url)) {
            console.error(`URL for ${id} not in web-specs: ${url.toString()}`);
            suggestSpecs(url);
            errors++;
        }
        checkedSpecs++;
    }
    checkedFeatures++;
}

if (errors) {
    console.log(`\nChecked ${checkedSpecs} specs in ${checkedFeatures} features, found ${errors} error(s)`);
    process.exit(1);
} else {
    console.log(`\nChecked ${checkedSpecs} specs in ${checkedFeatures} features, no errors`);
}
