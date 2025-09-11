import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { WebFeaturesData, Status } from "./types";

const jsonPath = fileURLToPath(new URL("./data.extended.json", import.meta.url));
const { browsers, features, groups, snapshots } = JSON.parse(
  readFileSync(jsonPath, { encoding: "utf-8" }),
) as WebFeaturesData;

/**
 * Get the baseline status for a specific browser compatibility key.
 * @param featureId - Optional feature ID to search within (improves performance if known)
 * @param bcdKey - The browser compatibility data key (e.g., "api.HTMLElement.focus")
 * @returns The baseline status object for the key, or undefined if not found
 */
function getStatus(featureId: string | undefined, bcdKey: string): Status | undefined {
  if (featureId) {
    // Direct lookup when feature ID is provided
    const feature = features[featureId];
    if (feature?.status?.by_compat_key?.[bcdKey]) {
      return feature.status.by_compat_key[bcdKey];
    }
    return undefined;
  }
  
  // Fallback to searching all features when no feature ID is provided
  for (const feature of Object.values(features)) {
    if (feature.status?.by_compat_key?.[bcdKey]) {
      return feature.status.by_compat_key[bcdKey];
    }
  }
  return undefined;
}

export { browsers, features, groups, snapshots, getStatus };
