import webSpecs from 'web-specs' assert { type: 'json' };

import features from '../index.js';

const specUrls = new Set(webSpecs.map(spec => spec.nightly.url));

let checked = 0;
let errors = 0;

for (const [id, data] of Object.entries(features)) {
    const url = new URL(data.spec);
    // Remove any #fragment from end of URL.
    url.hash = '';
    if (!specUrls.has(url.toString())) {
        console.error(`URL for ${id} not in web-specs: ${url}`);
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
