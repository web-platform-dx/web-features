import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const jsonPath = fileURLToPath(new URL("./data.extended.json", import.meta.url));
const { browsers, features, groups, snapshots } = JSON.parse(readFileSync(jsonPath, { encoding: "utf-8" }));
/**
 * Get the baseline status for a specific browser compatibility key.
 * @param featureId - Optional feature ID to search within (improves performance if known)
 * @param bcdKey - The browser compatibility data key (e.g., "api.HTMLElement.focus")
 * @returns The baseline status object for the key, or undefined if not found
 */
function getStatus(featureId, bcdKey) {
    var _a, _b, _c, _d;
    if (featureId) {
        // Direct lookup when feature ID is provided
        const feature = features[featureId];
        if ((_b = (_a = feature === null || feature === void 0 ? void 0 : feature.status) === null || _a === void 0 ? void 0 : _a.by_compat_key) === null || _b === void 0 ? void 0 : _b[bcdKey]) {
            return feature.status.by_compat_key[bcdKey];
        }
        return undefined;
    }
    // Fallback to searching all features when no feature ID is provided
    for (const feature of Object.values(features)) {
        if ((_d = (_c = feature.status) === null || _c === void 0 ? void 0 : _c.by_compat_key) === null || _d === void 0 ? void 0 : _d[bcdKey]) {
            return feature.status.by_compat_key[bcdKey];
        }
    }
    return undefined;
}
export { browsers, features, groups, snapshots, getStatus };
