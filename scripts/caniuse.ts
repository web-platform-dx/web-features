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

for (const [id, data] of Object.entries(features)) {
    if (!('caniuse' in data)) {
        continue;
    }
    const caniuseId = data.caniuse;
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
    logger.verbose(`- ${checkbox} ${caniuseId}${details}`);
}

logger.verbose("");
logger.info(`Summary: ${matched}/${mapping.size} features matched`);
