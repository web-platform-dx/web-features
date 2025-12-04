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
    if (compareBaselineValue(note.old_baseline_value, baseline) <= 0) {
      throw new Error(
        `regression note ${index} on ${id}.yml no longer applies (status is ${baseline}, was ${note.old_baseline_value}). Delete this note.`,
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

// TODO: assertValidSnapshotReference
