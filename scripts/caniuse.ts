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

const hiddenCaniuseItems = Object.entries(lite.features).flatMap(([id, data]) => !lite.feature(data).shown ? [id] : []);

for (const [id, data] of Object.entries(features)) {
    if (!('caniuse' in data)) {
        continue;
    }
    const caniuseId = data.caniuse;
    if (!mapping.has(caniuseId)) {
        throw new Error(`Invalid caniuse ID used for ${id}: ${caniuseId}`);
    }
    if (hiddenCaniuseItems.includes(caniuseId)) {
        throw new Error(`The caniuse ID used for "${id}" ("${caniuseId}") is hidden on caniuse.com`);
    }

    mapping.set(caniuseId, id);
}

let matched = 0;

for (const [caniuseId, id] of mapping.entries()) {
    const isHidden = hiddenCaniuseItems.includes(caniuseId);
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
