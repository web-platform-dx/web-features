import { computeBaseline } from "compute-baseline";
import { Compat } from "compute-baseline/browser-compat-data";

// For applications of this script, see:
// /packages/compute-baseline/src/baseline/index.test.ts#L97

const c = new Compat();
const needles = [];

for (const feature of c.walk()) {
  if (feature.id.startsWith("webextensions.")) {
    continue;
  }

  try {
    const lone = computeBaseline({
      compatKeys: [feature.id],
      checkAncestors: false,
    });
    const ancestral = computeBaseline({
      compatKeys: [feature.id],
      checkAncestors: true,
    });
    if (lone.baseline !== ancestral.baseline) {
      needles.push([
        feature,
        JSON.parse(lone.toJSON()),
        JSON.parse(ancestral.toJSON()),
      ]);
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("contains no support data for")
    ) {
      console.warn(
        `${feature.id} contains no support data for one or more core browser set browsers. Skipping.`,
      );
      continue;
    }
  }
}

console.log("| Compat key | Baseline status | With ancestors |");
console.log("| --- | --- | --- |");
for (const [feature, lone, ancestral] of needles) {
  console.log(
    `| \`${feature.id}\` | \`${lone.baseline}\` | \`${ancestral.baseline}\` |`,
  );
}
