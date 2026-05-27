import { Compat } from "compute-baseline/browser-compat-data";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import { features, groups } from "../index.ts";
import { isOrdinaryFeatureData } from "../type-guards.ts";
import { caniuseToWebFeaturesId } from "./caniuse.ts";
import { compatFeaturesToCumulativeDaysShipped } from "./unmapped-compat-keys.ts";

interface Result {
  featureCount: number;
  groupCount: number;
  compatKeys: number;
  unmappedCompatKeys: number;
  unmappedCompatKeysNormal: number;
  unmappedCompatKeysDiscourageable: number;
  unmappedCompatKeysCumulativeShippingDays: number;
  unmappedCompatKeysCumulativeShippingDaysNormal: number;
  unmappedCompatKeysCumulativeShippingDaysDiscourageable: number;
  caniuseIds: number;
  unmappedCaniuseIds: number;
  change?: Change;
}

type ResultKey = keyof Result;
type ChangeKey = `${ResultKey}Change`;
type Change = Record<ChangeKey, number>;

const argv = yargs(process.argv.slice(2))
  .scriptName("stats")
  .option("previous", {
    alias: "p",
    type: "string",
    description: "Path to a JSON file",
    coerce: (filePath) => {
      const raw = readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    },
  })
  .usage("$0", "Generate statistics")
  .parseSync();

export function stats(previous: Partial<Result>): Result {
  const featureCount = Object.values(features).filter(
    isOrdinaryFeatureData,
  ).length;
  const groupCount = Object.values(groups).length;

  const mappedCompatKeys = new Set(
    Object.values(features).flatMap((f) => {
      if (isOrdinaryFeatureData(f)) {
        return f.compat_features ?? [];
      }
      return [];
    }),
  );

  let compatKeys = 0;
  let unmappedCompatKeys = 0;
  let unmappedCompatKeysNormal = 0;
  let unmappedCompatKeysDiscourageable = 0;
  for (const f of new Compat().walk()) {
    if (!f.id.startsWith("webextensions.")) {
      compatKeys += 1;
      unmappedCompatKeys += mappedCompatKeys.has(f.id) ? 0 : 1;
      if (f.deprecated || !f.standard_track) {
        unmappedCompatKeysNormal += 1;
      } else {
        unmappedCompatKeysDiscourageable += 1;
      }
    }
  }

  const featuresToDays = compatFeaturesToCumulativeDaysShipped();
  const unmappedCompatKeysCumulativeShippingDaysDiscourageable = [
    ...featuresToDays.values(),
  ].reduce((prev, curr) => prev + curr, 0);
  const unmappedCompatKeysCumulativeShippingDaysNormal = (() => {
    let sum = 0;
    for (const [feature, days] of featuresToDays.entries()) {
      if (!feature.deprecated && feature.standard_track) {
        sum += days;
      }
    }
    return sum;
  })();
  const unmappedCompatKeysCumulativeShippingDays =
    unmappedCompatKeysCumulativeShippingDaysDiscourageable +
    unmappedCompatKeysCumulativeShippingDaysNormal;

  const caniuseIds = [...caniuseToWebFeaturesId.keys()].length;
  const unmappedCaniuseIds = [...caniuseToWebFeaturesId.values()].filter(
    (v) => v === null,
  ).length;

  const result = {
    featureCount,
    groupCount,
    compatKeys,
    unmappedCompatKeys,
    unmappedCompatKeysNormal,
    unmappedCompatKeysDiscourageable,
    unmappedCompatKeysCumulativeShippingDays,
    unmappedCompatKeysCumulativeShippingDaysNormal,
    unmappedCompatKeysCumulativeShippingDaysDiscourageable,
    caniuseIds,
    unmappedCaniuseIds,
  };

  if (previous) {
    const change = Object.fromEntries(
      Object.keys(previous).map((key) => [
        `${key}Change`,
        result[key] - previous[key],
      ]),
    ) as Change;
    return { ...result, change };
  }
  return result;
}

if (import.meta.url.startsWith("file:")) {
  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log(JSON.stringify(stats(argv.previous), undefined, 2));
  }
}
