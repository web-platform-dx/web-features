import { isOrdinaryFeatureData } from "./type-guards";
import { BaselineValue, FeatureData } from "./types";
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
 * Assert that a regression note is still relevant.
 *
 * A fresh regression note must represent a status change where the
 * `previous_baseline_value` value is better than the current `status.baseline`
 * value. A regression note must represent a change in status from high to low,
 * high to not Baseline, or low to not Baseline. A regression note must not
 * represent a status change that has aged, such that the current
 * `status.baseline` value has progressed back to `previous_baseline_value`.
 *
 * @export
 * @param {string} id The ID of the feature to be checked
 * @param {FeatureData} data The ordinary feature data to be checked
 */
export function assertFreshRegressionNotes(
  id: string,
  data: FeatureData,
): void {
  if (!isOrdinaryFeatureData(data)) {
    return;
  }

  const { baseline } = data.status;
  const notes = data.notes ? data.notes : [];

  for (const [index, note] of notes.entries()) {
    if (compareBaselineValue(note.previous_baseline_value, baseline) <= 0) {
      throw new Error(
        `regression note ${index} on ${id}.yml no longer applies (status is ${baseline}, was ${note.previous_baseline_value}). Delete this note.`,
      );
    }
  }
}

function compareBaselineValue(a: BaselineValue, b: BaselineValue): number {
  const statusToNumber = new Map<BaselineValue, number>([
    ["high", 2],
    ["low", 1],
    [false, 0],
  ]);
  return statusToNumber.get(a) - statusToNumber.get(b);
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
  if (!feature.discouraged) {
    return;
  }
  if (feature.discouraged.removal_date) {
    return;
  }
  if (Object.keys(feature.status.support).length > 0) {
    return;
  }
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
