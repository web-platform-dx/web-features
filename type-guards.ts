import type { FeatureData, FeatureRedirectData } from "./types";

export function isOrdinaryFeatureData(x: unknown): x is FeatureData {
  return typeof x === "object" && "name" in x;
}

export function isRedirectData(x: unknown): x is FeatureRedirectData {
  return typeof x === "object" && "redirect" in x;
}
