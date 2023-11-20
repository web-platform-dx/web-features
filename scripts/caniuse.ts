import lite from 'caniuse-lite';
import winston from "winston";

import features from '../index.js';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.printf(({level, message}) => `${message}`)
})

if (process.argv.includes("--quiet")) {
    logger.add(new winston.transports.Console({ level: 'info'}));
} else {
    logger.add(new winston.transports.Console({ level: 'verbose' }));
}

// Create a map from caniuse feature identifers to our identifiers, making
// it possible to enumerate matched and unmatched features.
const mapping = new Map<string, string | null>(
    Object.keys(lite.features).sort().map(id => [id, null])
);

// Fix missing key-value in @types/caniuse-lite
// TODO: remove this declaration when https://github.com/DefinitelyTyped/DefinitelyTyped/pull/67330 lands
declare module 'caniuse-lite' {
    interface Feature {
      shown: boolean;
    }
  }

const hiddenCaniuseItems = new Set<string>();
for (const [id, data] of Object.entries(lite.features)) {
    if (!lite.feature(data).shown) {
        hiddenCaniuseItems.add(id);
    }
}

for (const [id, data] of Object.entries(features)) {
    if (!('caniuse' in data)) {
        continue;
    }
    const caniuseIds: string[] = typeof data.caniuse === "string" ? [data.caniuse] : data.caniuse;
    for (const caniuseId in caniuseIds) {
        if (!mapping.has(caniuseId)) {
            throw new Error(`Invalid caniuse ID used for ${id}: ${caniuseId}`);
        }
        mapping.set(caniuseId, id);
    }
}

let matched = 0;

for (const [caniuseId, id] of mapping.entries()) {
    const isHidden = hiddenCaniuseItems.has(caniuseId);
    const isComplete = id || isHidden;

    if (isComplete) {
        matched++;
    }

    const checkbox = isComplete ? "[x]" : "[ ]";
    let details = '';
    if (id && id !== caniuseId) {
        details = ` (as ${id})`;
    }
    if (isHidden) {
        details = " (hidden on caniuse.com 🤫)";
    }

    const strike = isHidden ? "~~" : "";
    logger.verbose(`- ${checkbox} ${strike}${caniuseId}${strike}${details}`);
}

logger.verbose("");
logger.info(`Summary: ${matched}/${mapping.size} features matched`);
