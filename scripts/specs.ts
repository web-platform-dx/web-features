import assert from "node:assert/strict";

import webSpecs from "web-specs" assert { type: "json" };

import { features } from "../index.js";

// Specs needs to be in "good standing". Nightly URLs are used if available,
// otherwise the snapshot/versioned URL is used. See browser-specs/web-specs
// docs for more details:
// https://github.com/w3c/browser-specs/blob/main/README.md#standing
// https://github.com/w3c/browser-specs/blob/main/README.md#nightly
// https://github.com/w3c/browser-specs/blob/main/README.md#url
const specUrls: URL[] = webSpecs
  .filter((spec) => spec.standing === "good")
  .flatMap((spec) => {
    return [
      new URL(spec.nightly?.url ?? spec.url),
      ...(spec.nightly?.pages ?? []).map((page) => new URL(page)),
    ];
  });

type allowlistItem = [url: string, message: string];
const defaultAllowlist: allowlistItem[] = [
  // [
  //     "https://example.com/spec/",
  //     "Allowed because…. Remove this exception when https://example.com/org/repo/pull/1234 merges."
  // ]
  [
    "https://wicg.github.io/controls-list/",
    "Allowed because it's shipped in Chrome. Remove this exception if https://github.com/whatwg/html/pull/6715 is merged.",
  ],
  [
    "https://www.w3.org/TR/webnn/",
    "Allowed because this URL actually serves the same content as the Editor Draft URL, and because the ED URL is a bit verbose. See https://github.com/mdn/browser-compat-data/pull/22569#issuecomment-1992632118.",
  ],
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
  assert.ok(
    isOK(
      new URL(
        "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.at",
      ),
    ),
  );
  assert.ok(
    !isOK(new URL("https://typo.csswg.org/css-anchor-position-1/#anchoring")),
  );
  assert.ok(
    !isOK(new URL("https://w3c.github.io/gamepad/extensions.htmltypo")),
  );
  // Skip noisy test
  // assert.ok(isOK(new URL("https://www.example.com/"), [["https://www.example.com/", "Remove this exception when…"]]));
}
testIsOK();

/**
 * Print an array of potential spec URLs.
 */
function suggestSpecs(bad: URL): void {
  const searchBy = bad.pathname.replaceAll("/", "");
  const suggestions = specUrls
    .filter((specUrl) => specUrl.toString().includes(searchBy))
    .map((u) => `- ${u}`);
  if (suggestions.length > 0) {
    console.warn("Did you mean one of these?");
    console.warn(`${suggestions.join("\n")}`);
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
  console.log(
    `\nChecked ${checkedSpecs} specs in ${checkedFeatures} features, found ${errors} error(s)`,
  );
  process.exit(1);
} else {
  console.log(
    `\nChecked ${checkedSpecs} specs in ${checkedFeatures} features, no errors`,
  );
}
