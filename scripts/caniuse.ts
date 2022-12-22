import caniuse from 'caniuse-lite';

import features from '../index';

// Create a map from caniuse feature identifers to our identifiers, making
// it possible to enumerate matched and unmatched features.
const mapping = new Map<string, string | null>(
    Object.keys(caniuse.features).sort().map(id => [id, null])
);

for (const [id, data] of Object.entries(features)) {
    if (!('caniuse' in data)) {
        continue;
    }
    const caniuseId = data.caniuse;
    if (typeof caniuseId !== 'string') {
        throw new Error(`Caniuse ID must be string, got ${typeof caniuseId}`);
    }
    if (!mapping.has(caniuseId)) {
        throw new Error(`Invalid caniuse ID used for ${id}: ${caniuseId}`);
    }
    mapping.set(caniuseId, id);
}


let matched = 0;

for (const [caniuseId, id] of mapping.entries()) {
    let checkbox = '[ ]';
    let details = '';
    if (id) {
        checkbox = '[x]';
        if (id !== caniuseId) {
            details = ` (as ${id})`;
        }
        matched++;
    }
    console.log(`- ${checkbox} ${caniuseId}${details}`);
}

console.log();
console.log(`Summary: ${matched}/${mapping.size} features matched`);
