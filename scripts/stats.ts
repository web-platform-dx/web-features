import { Compat } from "compute-baseline/browser-compat-data";
import { features } from "../index.js";

const featureCount = Object.keys(features).length;

const keys = [...new Compat().walk()]
  .filter((f) => !f.id.startsWith("webextensions"))
  .map((f) => f.id).length;

const compatKeys = Object.values(features).flatMap(
  (f) => f.compat_features ?? [],
).length;

const featureSizes = Object.values(features)
  .map((feature) => (feature.compat_features ?? []).length)
  .sort((a, b) => a - b);

const stats = {
  features: featureCount,
  compatKeys,
  compatCoverage: compatKeys / keys,
  compatKeysPerFeatureMean: compatKeys / featureCount,
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
};

console.log(JSON.stringify(stats, undefined, 2));

const todoKeys = [...new Compat().walk()]
  .filter((f) => !f.id.startsWith("webextensions") && !f.deprecated)
  .map((f) => f.id);

const doneKeys = Object.values(features).flatMap(
  (f) => f.compat_features ?? [],
);

let symDifference = todoKeys
  .filter((x) => !doneKeys.includes(x))
  .concat(doneKeys.filter((x) => !todoKeys.includes(x)));
console.dir(symDifference, { maxArrayLength: null });
