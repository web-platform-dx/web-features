import { computeBaseline } from "compute-baseline";
import { Compat } from "compute-baseline/browser-compat-data";

const c = new Compat();
const needles = [];

for (const feature of c.walk()) {
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
    if (err instanceof Error) {
      err.message.includes("contains non-real values");
      console.warn(
        `${feature.id} or an ancestor contains non-real-values. Skipping.`,
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
