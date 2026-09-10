import { Compat } from "compute-baseline/browser-compat-data";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import { isOrdinaryFeatureData } from "../type-guards.ts";

// A release tag after "v3.5.1" or "next"
type SupportedReleaseTag =
  (`v{string}` & { __brand: "version ok" }) | "next" | "latest";

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
      return JSON.parse(raw) as Result;
    },
  })
  .option("previous-release", {
    type: "string",
    description:
      "Fetch a previous release's (a tag, such as `next` or `v3.36.0`, or `latest`) stats to compare against",
    coerce: parseReleaseTag,
  })
  .usage("$0", "Generate statistics")
  .parseSync();

export async function stats(previous: Partial<Result>): Promise<Result> {
  const { features, groups } = await import("../index.ts");
  const { caniuseToWebFeaturesId } = await import("./caniuse.ts");
  const { compatFeaturesToCumulativeDaysShipped } =
    await import("./unmapped-compat-keys.ts");

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
  const mappedNormalCompatKeysCount = mappedCompatKeys.difference(
    discourageableCompatKeys,
  ).size;
  const unmappedDiscourageableCompatKeysCount =
    unmappedKeys.difference(normalCompatKeys).size;
  const mappedDiscourageableCompatKeysCount =
    mappedCompatKeys.difference(normalCompatKeys).size;

  assert.equal(
    mappedCompatKeysCount,
    mappedNormalCompatKeysCount + mappedDiscourageableCompatKeysCount,
  );
  assert.equal(
    unmappedCompatKeysCount,
    unmappedNormalCompatKeysCount + unmappedDiscourageableCompatKeysCount,
  );

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

async function fetchStats(tagOrLatest: SupportedReleaseTag): Promise<Result> {
  const url =
    tagOrLatest === "latest"
      ? "https://github.com/web-platform-dx/web-features/releases/latest/download/stats.json"
      : `https://github.com/web-platform-dx/web-features/releases/download/${tagOrLatest}/stats.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to get previous release's stats.json file (${response.status})`,
    );
  }
  return response.json() as Promise<Result>;
}

function parseReleaseTag(tag: string): SupportedReleaseTag {
  if (tag === "next" || tag === "latest") {
    return tag as SupportedReleaseTag;
  }
  if (!tag.startsWith("v")) {
    throw new Error("Release tags start with `v`");
  }
  const numbers = tag.slice(1).split(".");
  if (numbers.length !== 3) {
    throw new Error("Release tags must be in SemVer-like vX.Y.Z format");
  }
  const major = parseInt(numbers[0], 10);
  const minor = parseInt(numbers[1], 10);
  const patch = parseInt(numbers[2], 10);

  if ([major, minor, patch].some(isNaN)) {
    throw new Error("Release tags must be in SemVer-like vX.Y.Z format");
  }

  if ((major == 3 && minor <= 35) || major <= 2) {
    throw new Error(
      "This script can't handle releases at or before v3.36.0. If you need such stats, then file an issue.",
    );
  }
  return tag as SupportedReleaseTag;
}

async function main() {
  let previous: Result | undefined;
  if (argv.previous) {
    previous = argv.previous;
  } else if (argv.previousRelease) {
    previous = await fetchStats(argv.previousRelease);
  }
  console.log(JSON.stringify(await stats(previous), undefined, 2));
}

if (import.meta.url.startsWith("file:")) {
  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    await main();
  }
}
