import type { FeatureData, FeatureMovedData, FeatureSplitData } from "./types";

export function isOrdinaryFeatureData(x: unknown): x is FeatureData {
  return typeof x === "object" && "kind" in x && x.kind === "feature";
}

export function isSplit(x: unknown): x is FeatureSplitData {
  return typeof x === "object" && "kind" in x && x.kind === "moved";
}

export function isMoved(x: unknown): x is FeatureMovedData {
  return typeof x === "object" && "kind" in x && x.kind === "moved";
}
