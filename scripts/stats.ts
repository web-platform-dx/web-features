import { Compat } from "compute-baseline/browser-compat-data";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import { features } from "../index.js";

const argv = yargs(process.argv.slice(2))
  .scriptName("stats")
  .usage("$0", "Generate statistics")
  .option("verbose", {
    alias: "v",
    describe: "Show more detailed stats",
    type: "count",
    default: 0,
  }).argv;

export function stats(detailed: boolean = false) {
  const featureCount = Object.keys(features).length;

  const keys = [];
  const doneKeys = Object.values(features).flatMap(
    (f) => f.compat_features ?? [],
  );
  const toDoKeys = [];
  const deprecatedNonStandardKeys = [];

  for (const f of new Compat().walk()) {
    if (!f.id.startsWith("webextensions")) {
      keys.push(f.id);

      if (!f.deprecated && f.standard_track) {
        if (!doneKeys.includes(f.id)) {
          toDoKeys.push(f.id);
        }
      } else {
        deprecatedNonStandardKeys.push(f.id);
      }
    }
  }

  const featureSizes = Object.values(features)
    .map((feature) => (feature.compat_features ?? []).length)
    .sort((a, b) => a - b);

  const result = {
    features: featureCount,
    compatKeys: doneKeys.length,
    compatKeysUnmapped: toDoKeys.length + deprecatedNonStandardKeys.length,
    compatCoverage: doneKeys.length / keys.length,
    compatKeysPerFeatureMean: doneKeys.length / featureCount,
    compatKeysPerFeatureMedian: (() => {
      const sizes = featureSizes;
      const middle = Math.floor(sizes.length / 2);
      return sizes.length % 2
        ? sizes[middle]
        : (sizes[middle - 1] + sizes[middle]) / 2;
    })(),
    compatKeysPerFeatureMode: (() => {
      const frequencyMap = new Map<number, number>();
      for (const size of featureSizes) {
        frequencyMap.set(size, (frequencyMap.get(size) ?? 0) + 1);
      }
      return [...frequencyMap.entries()]
        .sort(
          ([sizeA, frequencyA], [sizeB, frequencyB]) => frequencyA - frequencyB,
        )
        .pop()[0];
    })(),
    currentBurndown: undefined,
    currentBurndownSize: toDoKeys.length,
  };

  if (detailed) {
    result.currentBurndown = toDoKeys;
  }

  return result;
}

if (import.meta.url.startsWith("file:")) {
  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log(JSON.stringify(stats(argv.verbose), undefined, 2));
  }
}
