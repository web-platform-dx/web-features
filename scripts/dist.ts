import { Temporal } from "@js-temporal/polyfill";
import {
  computeBaseline,
  getStatus,
  parseRangedDateString,
  setLogger,
} from "compute-baseline";
import { Compat, Feature } from "compute-baseline/browser-compat-data";
import { fdir } from "fdir";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import winston from "winston";
import YAML, { Document, Scalar, YAMLSeq } from "yaml";
import yargs from "yargs";

const compat = new Compat();

const argv = yargs(process.argv.slice(2))
  .scriptName("dist")
  .usage("$0 [paths..]", "Generate .yml.dist from .yml", (yargs) =>
    yargs.positional("paths", {
      describe: "Directories or files to check/update.",
      default: ["features"],
    }),
  )
  .option("check", {
    boolean: true,
    default: false,
    describe: "Check that dist files are up-to-date instead of updating.",
  })
  .option("verbose", {
    alias: "v",
    describe: "Show more information about calculating the status",
    type: "count",
    default: 0,
    defaultDescription: "warn",
  }).argv;

const logger = winston.createLogger({
  level: argv.verbose > 0 ? "debug" : "warn",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: new winston.transports.Console(),
});

let exitStatus = 0;

setLogger(logger);

/**
 * Update (or create) a dist YAML file from a feature definition YAML file.
 *
 * @param {string} sourcePath The path to the human-authored YAML file.
 * @param {string} distPath The path to the generated dist YAML file.
 */
function updateDistFile(sourcePath: string, distPath: string): void {
  const distString = toDist(sourcePath).toString({ lineWidth: 0 });
  fs.writeFileSync(distPath, distString);
}

/**
 * Check a dist YAML file from a feature definition YAML file.
 *
 * @param {string} sourcePath The path to the human-authored YAML file.
 * @param {string} distPath The path to the generated dist YAML file.
 * @returns true if the dist file is up-to-date, otherwise false.
 */
function checkDistFile(sourcePath: string, distPath: string): boolean {
  const expected = toDist(sourcePath).toString({ lineWidth: 0 });
  try {
    const actual = fs.readFileSync(distPath, { encoding: "utf-8" });
    return actual === expected;
  } catch {
    return false;
  }
}

type SupportStatus = ReturnType<typeof getStatus>;

/**
 * Compare two status objects for sorting.
 *
 * @returns -1, 0 or 1.
 */
function compareStatus(a: SupportStatus, b: SupportStatus) {
  // First sort by Baseline status/date, oldest Base features first, and
  // non-Baseline features last.

  if (a.baseline_low_date !== b.baseline_low_date) {
    if (!a.baseline_low_date) {
      return 1;
    }
    if (!b.baseline_low_date) {
      return -1;
    }

    const [aLowDate, aLowRanged] = parseRangedDateString(a.baseline_low_date);
    const [bLowDate, bLowRanged] = parseRangedDateString(b.baseline_low_date);

    // Older dates first
    if (Temporal.PlainDate.compare(aLowDate, bLowDate) !== 0) {
      return Temporal.PlainDate.compare(aLowDate, bLowDate);
    }

    // If dates are equal, then unranged values go first
    if (!aLowRanged && bLowRanged) {
      return -1;
    }
    if (!bLowRanged && aLowRanged) {
      return 1;
    }
  }

  // Next sort by number of supporting browsers.
  const aBrowsers = Object.keys(a.support).length;
  const bBrowsers = Object.keys(b.support).length;
  if (aBrowsers !== bBrowsers) {
    return bBrowsers - aBrowsers;
  }
  // Finally sort by the version numbers.
  const aVersions = Object.values(a.support);
  const bVersions = Object.values(b.support);
  for (let i = 0; i < aVersions.length; i++) {
    if (aVersions[i] !== bVersions[i]) {
      const [aRanged, aVersion] = aVersions[i].startsWith("≤")
        ? [true, aVersions[i].slice(1)]
        : [false, aVersions[i]];
      const [bRanged, bVersion] = bVersions[i].startsWith("≤")
        ? [true, bVersions[i].slice(1)]
        : [false, bVersions[i]];

      if (aVersion !== bVersion) {
        if (!aRanged && bRanged) {
          return -1;
        }
        if (!bRanged && aRanged) {
          return 1;
        }
      }

      return Number(aVersion) - Number(bVersion);
    }
  }
  return 0;
}

/**
 * Generate a dist YAML document from a feature definition YAML file path.
 *
 * This passes through most of the contents of a feature definition. If
 * possible, it fills in `compat_features` from @mdn/browser-compat-data and, if
 * successful, generates a `status` block.
 */
function toDist(sourcePath: string): YAML.Document {
  const source = YAML.parse(fs.readFileSync(sourcePath, { encoding: "utf-8" }));
  const { name: id } = path.parse(sourcePath);

  // Collect tagged compat features. A `compat_features` list in the source
  // takes precedence, but can be removed if it matches the tagged features.
  const taggedCompatFeatures = (tagsToFeatures.get(`web-features:${id}`) ?? [])
    .map((f) => `${f.id}`)
    .sort();

  if (source.compat_features) {
    source.compat_features.sort();
    if (isDeepStrictEqual(source.compat_features, taggedCompatFeatures)) {
      logger.warn(
        `${id}: compat_features override matches tags in @mdn/browser-compat-data. Consider deleting the compat_features override.`,
      );
    }
  }

  const compatFeatures = source.compat_features ?? taggedCompatFeatures;
  let computeFrom = compatFeatures;

  const computeFromWasExplicitlySet = source.status?.compute_from !== undefined;
  if (computeFromWasExplicitlySet) {
    const compute_from = source.status.compute_from;
    const keys = Array.isArray(compute_from) ? compute_from : [compute_from];
    for (const key of keys) {
      if (!compatFeatures.includes(key)) {
        throw new Error(
          `${id}: compute_from key ${key} is not among the feature's compat keys`,
        );
      }
    }

    computeFrom = keys;
    delete source.status;
  }

  // Compute the status. A `status` block in the source takes precedence, but
  // can be removed if it matches the computed status.
  let computedStatus = computeBaseline({
    compatKeys: computeFrom,
    checkAncestors: true,
  });

  if (computedStatus.discouraged) {
    logger.warn(
      `${id}: contains at least one deprecated compat feature and can never be Baseline. Was this intentional?`,
    );
  }

  computedStatus = JSON.parse(computedStatus.toJSON());

  if (source.status) {
    if (isDeepStrictEqual(source.status, computedStatus)) {
      logger.warn(
        `${id}: status override matches computed status. Consider deleting the status override.`,
      );
    }
  }

  // Map between status object and BCD keys with that computed status.
  const groups = new Map<SupportStatus, string[]>();
  for (const key of compatFeatures) {
    const status = getStatus(id, key);
    let added = false;
    for (const [existingKey, list] of groups.entries()) {
      if (isDeepStrictEqual(status, existingKey)) {
        list.push(key);
        added = true;
        break;
      }
    }
    if (!added) {
      groups.set(status, [key]);
    }
  }

  if (computeFromWasExplicitlySet) {
    if (groups.size === 1) {
      logger.error(
        `${id}: uses compute_from which must not be used when the overall status does not differ from the per-key statuses. Delete the status override.`,
      );
      exitStatus = 1;
    }
  }

  const sortedStatus = Array.from(groups.keys()).sort(compareStatus);

  const sortedGroups = new Map<string, string[]>();
  for (const status of sortedStatus) {
    let comment = YAML.stringify(status);
    if (isDeepStrictEqual(status, source.status ?? computedStatus)) {
      comment = `⬇️ Same status as overall feature ⬇️\n${comment}`;
    }
    sortedGroups.set(comment, groups.get(status));
  }

  // Assemble and return the dist YAML.
  const dist = new Document({});

  dist.commentBefore = [
    `Generated from: ${id}.yml`,
    `Do not edit this file by hand. Edit the source file instead!`,
  ]
    .map((line) => ` ${line}`)
    .join("\n");

  if (!source.status) {
    dist.set("status", computedStatus);
  }

  if (groups.size) {
    insertCompatFeatures(dist, sortedGroups);
  }

  return dist;
}

function insertCompatFeatures(yaml: Document, groups: Map<string, string[]>) {
  if (groups.size === 1) {
    // Add no comments when there's a single group.
    yaml.set("compat_features", groups.values().next().value);
    return;
  }

  const list = new YAMLSeq<Scalar<string>>();
  for (const [comment, keys] of groups.entries()) {
    let first = true;
    for (const key of keys) {
      const item = new Scalar(key);
      if (first) {
        item.commentBefore = comment
          .trim()
          .split("\n")
          .map((line) => ` ${line}`)
          .join("\n");
        first = false;
      }
      list.add(item);
    }
    // Blank line between each group.
    list.items.at(-1).comment = "\n";
  }
  // Avoid trailing blank line.
  list.items.at(-1).comment = "";
  yaml.set("compat_features", list);
}

const tagsToFeatures: Map<string, Feature[]> = (() => {
  // TODO: Use Map.groupBy() instead, when it's available
  const map = new Map();
  for (const feature of compat.walk()) {
    for (const tag of feature.tags) {
      let features = map.get(tag);
      if (!features) {
        features = [];
        map.set(tag, features);
      }
      features.push(feature);
    }
  }
  return map;
})();

function main() {
  const filePaths = argv.paths.flatMap((fileOrDirectory) => {
    if (fs.statSync(fileOrDirectory).isDirectory()) {
      return new fdir()
        .withBasePath()
        .filter((fp) => fp.endsWith(".yml") || fp.endsWith(".yml.dist"))
        .crawl(fileOrDirectory)
        .sync();
    }
    return fileOrDirectory;
  });

  // Map from .yml to .yml.dist to filter out duplicates.
  const sourceToDist = new Map<string, string>(
    filePaths.map((filePath: string) => {
      const ext = path.extname(filePath);
      if (![".dist", ".yml"].includes(ext)) {
        throw new Error(
          `Cannot generate dist for ${filePath}, only YAML input is supported`,
        );
      }
      // Start from the source even if dist is given.
      if (filePath.endsWith(".dist")) {
        const candidateFilePath = filePath.substring(0, filePath.length - 5);

        // Make sure this isn't an orphan dist file
        if (!fs.existsSync(candidateFilePath)) {
          throw new Error(
            `${filePath} has no corresponding ${candidateFilePath}`,
          );
        }
        filePath = candidateFilePath;
      }
      return [filePath, `${filePath}.dist`];
    }),
  );

  if (argv.check) {
    let updateNeeded = false;
    for (const [source, dist] of sourceToDist.entries()) {
      if (!checkDistFile(source, dist)) {
        logger.error(
          `${dist} needs to be updated. Use npm run dist ${source} to update.`,
        );
        updateNeeded = true;
      }
    }
    if (updateNeeded) {
      exitStatus = 1;
    }
  } else {
    // Update dist in place.
    for (const [source, dist] of sourceToDist.entries()) {
      updateDistFile(source, dist);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
  process.exit(exitStatus);
}
