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
    // Direct lookup when feature ID is provided
    if (featureId) {
        // Handle splits and redirects
        const resolvedFeatureIds = resolveFeatureId(featureId);
        if (resolvedFeatureIds.length === 0) {
            return;
        }
        for (const resolvedFeatureId of resolvedFeatureIds) {
            const feature = features[resolvedFeatureId];
            if ((_b = (_a = feature.status) === null || _a === void 0 ? void 0 : _a.by_compat_key) === null || _b === void 0 ? void 0 : _b[bcdKey]) {
                return feature.status.by_compat_key[bcdKey];
            }
        }
    }
    // Fall back to searching all features when no feature ID is provided
    for (const feature of Object.values(features)) {
        if (feature.kind !== "feature") {
            continue;
        }
        if ((_d = (_c = feature.status) === null || _c === void 0 ? void 0 : _c.by_compat_key) === null || _d === void 0 ? void 0 : _d[bcdKey]) {
            return feature.status.by_compat_key[bcdKey];
        }
    }
}
/**
 * Resolve the feature ID to its canonical form, following any number of splits and redirects.
 * @param featureId - The feature ID to resolve
 * @returns An array of canonical feature IDs (multiple if split)
 */
function resolveFeatureId(featureId) {
    let feature = features[featureId];
    if (!feature) {
        return [];
    }
    if (feature.kind === 'feature') {
        return [featureId];
    }
    if (feature.kind === 'moved') {
        return resolveFeatureId(feature.redirect_target);
    }
    if (feature.kind === 'split') {
        return feature.redirect_targets.flatMap(resolveFeatureId);
    }
    return [];
}
export { browsers, features, groups, snapshots, getStatus };
