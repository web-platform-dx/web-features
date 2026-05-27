import { Temporal } from "@js-temporal/polyfill";
import type { ParsedAuthoredData } from "./parse.ts";
import { isOrdinaryFeatureData } from "./type-guards.ts";
import type { WebFeaturesData } from "./types.quicktype.ts";
import type { BaselineHighLow, FeatureData, Status } from "./types.ts";

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
    Object.keys(feature.status.by_compat_key ?? {}).length > 0
  )
    return;
  throw new Error(
    `${id} is discouraged and has no reported support, so a removal date is required`,
  );
}

/**
 * Assert that `compat_features` keys are consistent with the feature's headline
 * status.
 */
export function assertCompatSetConsistency(
  id: string,
  headline: Status,
  featureData: ParsedAuthoredData,
) {
  const { core, modifier } = featureData.compatFeatures;
  for (const key of core) {
    const perKeyStatus = headline.by_compat_key[key];
    if (compareBaselineLevel(headline, perKeyStatus) > 0) {
      throw new Error(
        `${id}: core ${key} must be Baseline ${headline.baseline} or better (got ${perKeyStatus.baseline})`,
      );
    }
    if (
      headline.baseline_low_date &&
      compareBaselineLowDates(headline, perKeyStatus) < 0
    ) {
      throw new Error(
        `${id}: core ${key} must be Baseline low on or after headline (got ${perKeyStatus.baseline_low_date}, expected ≥${headline.baseline_low_date})`,
      );
    }
  }

  for (const key of modifier) {
    const perKeyStatus = headline.by_compat_key[key];
    if (compareBaselineLevel(headline, perKeyStatus) > 0) {
      throw new Error(
        `${id}: modifier ${key} must be Baseline ${headline.baseline} or better (got ${perKeyStatus.baseline})`,
      );
    }
  }
}

function compareBaselineLowDates(a: Status, b: Status): number {
  const aLow = a.baseline_low_date;
  const bLow = b.baseline_low_date;

  if (aLow === undefined && bLow === undefined) {
    return 0;
  } else if (aLow !== undefined && bLow == undefined) {
    return 1;
  } else if (aLow === undefined && bLow !== undefined) {
    return -1;
  } else {
    return Temporal.PlainDate.compare(
      Temporal.PlainDate.from(aLow.replaceAll("≤", "")),
      Temporal.PlainDate.from(bLow.replaceAll("≤", "")),
    );
  }
}

function compareBaselineLevel(a: Status, b: Status) {
  const toNumber = new Map<BaselineHighLow | boolean, number>([
    [false, 0],
    ["low", 1],
    ["high", 2],
  ]);
  return toNumber.get(a.baseline) - toNumber.get(b.baseline);
}

// TODO: assertValidSnapshotReference
