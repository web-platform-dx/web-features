import { Compat } from "compute-baseline/browser-compat-data";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import { features, groups } from "../index.ts";
import { isOrdinaryFeatureData } from "../type-guards.ts";
import { caniuseToWebFeaturesId } from "./caniuse.ts";
import { compatFeaturesToCumulativeDaysShipped } from "./unmapped-compat-keys.ts";

interface ResultBase {
  featuresCount: number; // `kind: feature` ID count (ignores other `kind` values)
  groupsCount: number; // group ID count
  compatKeysCount: number; // Count of in-scope BCD keys (i.e., excluding webextensions)
  normalCompatKeysCount: number; // Count of in-scope BCD keys that are "normal" — standard and not deprecated
  discourageableCompatKeysCount: number; // Count of in-scope BCD keys that are not "normal" — non-standard or deprecated

  // Mapped keys are mapped to one or more web-features entries (higher is better).
  // Unmapped keys are not mapped to any web-features entry (lower is better).
  mappedCompatKeysCount: number;
  unmappedCompatKeysCount: number;

  mappedNormalCompatKeysCount: number;
  unmappedNormalCompatKeysCount: number;

  mappedDiscourageableCompatKeysCount: number;
  unmappedDiscourageableCompatKeysCount: number;

  mappedCompatKeysRatio: number; // mappedCompatKeysCount : compatKeysCount
  unmappedCompatKeysRatio: number; // unmappedCompatKeysCount : compatKeysCount
  unmappedNormalCompatKeysRatio: number; // unmappedNormalCompatKeysCount : normalCompatKeysCount
  unmappedDiscourageableCompatKeysRatio: number; // unmappedDiscourageableCompatKeysCount : discourageableCompatKeysCount

  caniuseIdsCount: number; // caniuse IDs
  unmappedCaniuseIdsCount: number; // caniuseIDs that lack a corresponding web-features entry
  unmappedCaniuseIdsRatio: number; // unmappedCaniuseIdsCont : caniuseIDs

  // The "cumulative shipping days" metrics are the sum of days since each BCD
  // key has shipped in each browser in the core browser set. A smaller number
  // is better. This number increases every day for every key that has shipped
  // but has not been mapped. This metric encourages us to map keys that are
  // more likely to affect real-world developers (i.e., features implemented in
  // multiple browsers). Widely-implemented but not mapped keys increase this
  // metric more (up to +7 per calendar day per key), while other keys increase
  // this metric less or not at all. Keys which have not yet shipped in any
  // stable release count as 0. Like the Baseline calculation, partials and
  // prefixes do not count as shipping.
  unmappedCompatKeysCumulativeShippingDays: number;
  unmappedNormalCompatKeysCumulativeShippingDays: number;
  unmappedDiscourageableCompatKeysCumulativeShippingDays: number;
}

interface Result extends ResultBase {
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
  const featuresCount = Object.values(features).filter(
    isOrdinaryFeatureData,
  ).length;
  const groupsCount = Object.values(groups).length;

  const mappedCompatKeys = new Set(
    Object.values(features).flatMap((f) => {
      if (isOrdinaryFeatureData(f)) {
        return f.compat_features ?? [];
      }
      return [];
    }),
  );

  const inScopeCompatKeys = new Set<string>();
  const deprecatedCompatKeys = new Set<string>();
  const nonstandardCompatKeys = new Set<string>();
  for (const f of new Compat().walk()) {
    if (!f.id.startsWith("webextensions.")) {
      inScopeCompatKeys.add(f.id);
      if (f.deprecated) {
        deprecatedCompatKeys.add(f.id);
      }
      if (!f.standard_track) {
        nonstandardCompatKeys.add(f.id);
      }
    }
  }

  const discourageableCompatKeys = deprecatedCompatKeys.union(
    nonstandardCompatKeys,
  );
  const normalCompatKeys = inScopeCompatKeys.difference(
    discourageableCompatKeys,
  );
  const unmappedKeys = inScopeCompatKeys.difference(mappedCompatKeys);

  const compatKeysCount = inScopeCompatKeys.size;
  const normalCompatKeysCount = normalCompatKeys.size;
  const discourageableCompatKeysCount = compatKeysCount - normalCompatKeysCount;

  const mappedCompatKeysCount = mappedCompatKeys.size;
  const unmappedCompatKeysCount = unmappedKeys.size;
  const unmappedNormalCompatKeysCount = unmappedKeys.difference(
    discourageableCompatKeys,
  ).size;
  const mappedNormalCompatKeysCount =
    mappedCompatKeysCount - unmappedNormalCompatKeysCount;
  const unmappedDiscourageableCompatKeysCount =
    unmappedKeys.difference(normalCompatKeys).size;
  const mappedDiscourageableCompatKeysCount =
    discourageableCompatKeysCount - unmappedDiscourageableCompatKeysCount;

  const featuresToDays = compatFeaturesToCumulativeDaysShipped();
  const unmappedDiscourageableCompatKeysCumulativeShippingDays = Array.from(
    featuresToDays.entries(),
  )
    .filter(([f]) => discourageableCompatKeys.has(f.id))
    .map(([, days]) => days)
    .reduce((prev, curr) => prev + curr, 0);
  const unmappedNormalCompatKeysCumulativeShippingDays = Array.from(
    featuresToDays.entries(),
  )
    .filter(([f]) => normalCompatKeys.has(f.id))
    .map(([, days]) => days)
    .reduce((prev, curr) => prev + curr, 0);

  const unmappedCompatKeysCumulativeShippingDays =
    unmappedDiscourageableCompatKeysCumulativeShippingDays +
    unmappedNormalCompatKeysCumulativeShippingDays;

  const caniuseIdsCount = [...caniuseToWebFeaturesId.keys()].length;
  const unmappedCaniuseIdsCount = [...caniuseToWebFeaturesId.values()].filter(
    (v) => v === null,
  ).length;
  const unmappedCaniuseIdsRatio = unmappedCaniuseIdsCount / caniuseIdsCount;

  const mappedCompatKeysRatio = mappedCompatKeysCount / compatKeysCount;
  const unmappedCompatKeysRatio = unmappedCompatKeysCount / compatKeysCount;
  const unmappedNormalCompatKeysRatio =
    unmappedNormalCompatKeysCount / normalCompatKeysCount;
  const unmappedDiscourageableCompatKeysRatio =
    unmappedDiscourageableCompatKeysCount / discourageableCompatKeysCount;

  const result: ResultBase = {
    featuresCount,
    groupsCount,
    compatKeysCount,
    normalCompatKeysCount,
    discourageableCompatKeysCount,

    mappedCompatKeysCount,
    unmappedCompatKeysCount,

    mappedNormalCompatKeysCount,
    unmappedNormalCompatKeysCount,

    mappedDiscourageableCompatKeysCount,
    unmappedDiscourageableCompatKeysCount,

    mappedCompatKeysRatio,
    unmappedCompatKeysRatio,
    unmappedNormalCompatKeysRatio,
    unmappedDiscourageableCompatKeysRatio,

    caniuseIdsCount,
    unmappedCaniuseIdsCount,
    unmappedCaniuseIdsRatio,

    unmappedCompatKeysCumulativeShippingDays,
    unmappedNormalCompatKeysCumulativeShippingDays,
    unmappedDiscourageableCompatKeysCumulativeShippingDays,
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
