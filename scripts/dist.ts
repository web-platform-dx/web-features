import { Temporal } from "@js-temporal/polyfill";
import {
  BASELINE_LOW_TO_HIGH_DURATION,
  computeBaseline,
  setLogger,
} from "compute-baseline";
import { Compat, Feature } from "compute-baseline/browser-compat-data";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import winston from "winston";
import YAML, { Document } from "yaml";
import yargs from "yargs";

const argv = yargs(process.argv.slice(2))
  .scriptName("dist")
  .usage("$0 [filenames..]", "Generate .dist.yml from .yml", (yargs) =>
    yargs.positional("filenames", {
      describe: "YAML files to check/update.",
    }),
  )
  .demandOption("filenames")
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
  const actual = fs.readFileSync(distPath, { encoding: "utf-8" });
  return actual === expected;
}

/**
 * Generate a dist YAML document from a feature definition YAML file path.
 *
 * This passes through most of the contents of a feature definition. If
 * possible, it fills in `compat_features` from @mdn/browser-compat-data and, if
 * successful, generates a `status` block.
 */
function toDist(sourcePath: string): YAML.Document {
  const yaml = YAML.parseDocument(
    fs.readFileSync(sourcePath, { encoding: "utf-8" }),
  );
  const { name: id } = path.parse(sourcePath);

  const taggedCompatFeatures = (
    tagsToFeatures.get(`web-features:${id}`) ?? []
  ).map((f) => `${f.id}`);

  const overridden = {
    compatFeatures: yaml.toJS().compat_features,
    status: resolveBaselineHighDate(yaml.toJS().status),
  };

  const generated = {
    compatFeatures: taggedCompatFeatures.length
      ? taggedCompatFeatures
      : undefined,
    status: taggedCompatFeatures.length
      ? computeBaseline({
          compatKeys: taggedCompatFeatures as [string, ...string[]],
          checkAncestors: false,
        })
      : undefined,
    statusByCompatFeaturesOverride: Array.isArray(overridden.compatFeatures)
      ? computeBaseline({
          compatKeys: overridden.compatFeatures as [string, ...string[]],
          checkAncestors: false,
        })
      : undefined,
  };

  warnOnNeedlessOverrides(id, overridden, generated);

  if (overridden.status?.baseline === "high") {
    insertBaselineHighDate(yaml, overridden.status.baseline_high_date);
  }

  if (!overridden.compatFeatures && generated.compatFeatures) {
    insertCompatFeatures(yaml, generated.compatFeatures);
  }

  if (!overridden.status) {
    const status = generated.statusByCompatFeaturesOverride ?? generated.status;
    if (status) {
      if (status.discouraged) {
        logger.warn(
          `${id}: contains at least one deprecated compat feature and can never be Baseline. Was this intentional?`,
        );
      }
      insertStatus(yaml, JSON.parse(status.toJSON()));
    }
  }

  insertHeaderComments(yaml, id);

  return yaml;
}

function resolveBaselineHighDate(status) {
  if (
    status?.baseline === "high" &&
    typeof status?.baseline_low_date === "string"
  ) {
    return {
      ...status,
      baseline_high_date: Temporal.PlainDate.from(status.baseline_low_date)
        .add(BASELINE_LOW_TO_HIGH_DURATION)
        .toString(),
    };
  }
  return status;
}

function insertBaselineHighDate(yaml: Document, baselineHighDate: string) {
  // Append a high date…
  yaml.setIn(["status", "baseline_high_date"], baselineHighDate);

  // …then fix the order.
  const statusNode = yaml.get("status");
  assert(YAML.isMap(statusNode));
  const highDateNode = statusNode.items.pop();
  const targetIndex = statusNode.items.findIndex(
    (item) => item.key === "baseline_low_date",
  );
  statusNode.items.splice(targetIndex, 0, highDateNode);
}

function insertCompatFeatures(yaml: Document, compatFeatures: string[]) {
  yaml.set("compat_features", compatFeatures);
}

function insertStatus(yaml: Document, status) {
  // Create the status node and insert it just before "compat_features"
  const statusNode = yaml.createPair("status", status);
  assert(YAML.isMap(yaml.contents));
  const targetIndex = yaml.contents.items.findIndex(
    (item) => item.key.toString() === "compat_features",
  );
  yaml.contents.items.splice(targetIndex, 0, statusNode as YAML.Pair<any, any>);
}

function insertHeaderComments(yaml: Document, id: string) {
  yaml.commentBefore = [
    `Generated from: ${id}.yml`,
    `Do not edit this file by hand. Edit the source file instead!`,
  ]
    .map((line) => ` ${line}`)
    .join("\n");
}

const compat = new Compat();

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

function warnOnNeedlessOverrides(id, overridden, generated) {
  if (overridden.compatFeatures?.length && generated.compatFeatures?.length) {
    if (
      isDeepStrictEqual(
        [...overridden.compatFeatures].sort(),
        [...generated.compatFeatures].sort(),
      )
    ) {
      logger.warn(
        `${id}: compat_features override matches tags in @mdn/browser-compat-data. Consider deleting this override.`,
      );
    }
  }

  if (
    overridden.status &&
    generated.statusByCompatFeaturesOverride &&
    isDeepStrictEqual(
      overridden.status,
      generated.statusByCompatFeaturesOverride,
    )
  ) {
    logger.warn(
      `${id}: status override matches generated status from compat_features override. Consider deleting this override.`,
    );
  }
  if (
    overridden.status &&
    generated.status &&
    isDeepStrictEqual(overridden.status, generated.status)
  ) {
    logger.warn(
      `${id}: status override matches generated status from tags. Consider deleting this override.`,
    );
  }
}

function main() {
  // Map from .yml to .dist.yml to filter out duplicates.
  const sourceToDist = new Map(
    argv.filenames.map((filePath: string) => {
      let { dir, name, ext } = path.parse(filePath);
      if (ext !== ".yml") {
        throw new Error(
          `Cannot generate dist for ${filePath}, only YAML input is supported`,
        );
      }
      // Remove .dist to start from the source even if dist is given.
      if (name.endsWith(".dist")) {
        name = name.substring(0, name.length - 5);
      }
      return [
        path.format({ dir, name, ext: ".yml" }),
        path.format({ dir, name, ext: ".dist.yml" }),
      ];
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
      process.exit(1);
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
}
