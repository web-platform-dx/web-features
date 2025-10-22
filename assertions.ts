import { isOrdinaryFeatureData } from "./type-guards";
import { FeatureData } from "./types";
import { WebFeaturesData } from "./types.quicktype";

/**
 * Assert that a reference from one feature to another is an ordinary feature
 * reference (i.e., it's defined and not some kind of redirect).
 *
 * @export
 * @param {string} sourceId The feature that is referencing another feature
 * @param {string} targetId The feature being referenced
 * @param {WebFeaturesData["features"]} features Feature data
 */
export function assertValidFeatureReference(
  sourceId: string,
  targetId: string,
  features: WebFeaturesData["features"],
) {
  const target: unknown = features[targetId];
  if (target === undefined) {
    throw new Error(`${sourceId} references a non-existent feature`);
  }
  if (!isOrdinaryFeatureData(target)) {
    throw new Error(
      `${sourceId} references a redirect "${targetId} instead of an ordinary feature ID`,
    );
  }
}

/**
 * Assert that a discouraged feature with no supporting browsers has a
 * `removal_date`.
 *
 * @export
 * @param {string} id The ID of the feature to be checked
 * @param {FeatureData} feature The ordinary feature data to be checked
 */
export function assertRequiredRemovalDateSet(
  id: string,
  feature: FeatureData,
): void {
  if (!feature.discouraged) return;
  if (feature.discouraged.removal_date) return;
  if (Object.keys(feature.status.support).length > 0) return;
  if (
    feature.compat_features &&
    Object.keys(feature.status.by_compat_key).length > 0
  )
    return;
  throw new Error(
    `${id} is discouraged and has no reported support, so a removal date is required`,
  );
}

// TODO: assertValidSnapshotReference
