import lite from "caniuse-lite";
import { fileURLToPath } from "node:url";
import winston from "winston";
import { features } from "../index.js";
import { isOrdinaryFeatureData } from "../type-guards.js";

const logger = winston.createLogger({
  format: winston.format.printf(({ message }) => `${message}`),
});

export const hiddenCaniuseItems = new Set<string>(
  (() => {
    return Object.entries(lite.features)
      .sort()
      .flatMap(([id, data]) => {
        return lite.feature(data).shown ? [] : [id];
      });
  })(),
);

export const caniuseToWebFeaturesId: Map<string, string | null> = (() => {
  const mapping = new Map<string, string | null>(
    Object.keys(lite.features)
      .sort()
      .map((id) => [id, null]),
  );

  for (const [id, data] of Object.entries(features)) {
    if (!isOrdinaryFeatureData(data) || !data.caniuse) {
      continue;
    }
    for (const caniuseId of data.caniuse) {
      if (!mapping.has(caniuseId)) {
        throw new Error(`Invalid caniuse ID used for ${id}: ${caniuseId}`);
      }
      if (mapping.get(caniuseId)) {
        throw new Error(
          `Duplicate caniuse ID "${caniuseId}" used for "${id}" and "${mapping.get(caniuseId)}"`,
        );
      }
      if (hiddenCaniuseItems.has(caniuseId)) {
        throw new Error(
          `A caniuse ID used for "${id}" ("${caniuseId}") is hidden on caniuse.com`,
        );
      }
      mapping.set(caniuseId, id);
    }
  }
  return mapping;
})();

function main() {
  if (process.argv.includes("--quiet")) {
    logger.add(new winston.transports.Console({ level: "info" }));
  } else {
    logger.add(new winston.transports.Console({ level: "verbose" }));
  }

  let matched = 0;

  for (const [caniuseId, id] of caniuseToWebFeaturesId.entries()) {
    const isHidden = hiddenCaniuseItems.has(caniuseId);
    const isComplete = id || isHidden;

    if (isComplete) {
      matched++;
    }

    const checkbox = isComplete ? "[x]" : "[ ]";
    let details = "";
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
  logger.info(
    `Summary: ${matched}/${caniuseToWebFeaturesId.size} features matched`,
  );
}

if (import.meta.url.startsWith("file:")) {
  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
  }
}
