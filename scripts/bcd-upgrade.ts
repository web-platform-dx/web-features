import { Compat } from "compute-baseline/browser-compat-data";
import { fdir } from "fdir";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import winston from "winston";
import YAML from "yaml";
import yargs from "yargs";

const compat = new Compat();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: new winston.transports.Stream({
    stream: process.stderr,
  }),
});

type BaselineValue = "high" | "low" | false;

export interface BaselineChange {
  featureId: string;
  before: BaselineValue;
  after: BaselineValue;
}

interface SourceStatus {
  compute_from: string[];
}

interface SourceYml {
  name: string;
  description: string;
  spec: string[];
  status?: SourceStatus;
  compat_features?: string[];
}

interface DistStatus {
  baseline: BaselineValue;
  baseline_low_date?: string;
  baseline_high_date?: string;
  support?: Map<string, string>;
}

interface DistYml {
  status?: DistStatus;
  compat_features: string[];
}

class SourceFile {
  path: string;
  source: SourceYml;

  constructor(path: string) {
    this.path = path;
    this.#load();
  }

  #load() {
    this.source = YAML.parse(fs.readFileSync(this.path, { encoding: "utf-8" }));
  }

  get id(): string {
    return path.parse(this.path).name;
  }

  get compatFeatures(): Set<string> {
    return new Set(this.source?.compat_features ?? []);
  }

  get computeFrom(): Set<string> {
    return new Set(this.source?.status?.compute_from ?? []);
  }

  update(compatFeatures: string[] | null, computeFrom: string[] | null) {
    const doc = YAML.parseDocument(
      fs.readFileSync(this.path, { encoding: "utf-8" }),
    );

    let hasChanges = false;

    if (compatFeatures !== null) {
      hasChanges =
        updateYamlStringOrSequence(doc, ["compat_features"], compatFeatures) ||
        hasChanges;
    }

    if (computeFrom !== null) {
      hasChanges =
        updateYamlStringOrSequence(
          doc,
          ["status", "compute_from"],
          compatFeatures,
        ) || hasChanges;
    }

    if (hasChanges) {
      fs.writeFileSync(this.path, doc.toString({ lineWidth: 0 }));
      this.#load();
    }
  }
}

class DistFile {
  path: string;
  source: DistYml;

  constructor(path: string) {
    this.path = path;
    this.source = YAML.parse(fs.readFileSync(path, { encoding: "utf-8" }));
  }

  get id(): string {
    return path.parse(this.path).name.slice(0, -".yml".length);
  }

  get status(): BaselineValue {
    return this.source?.status?.baseline ?? false;
  }
}

class PreDistState {
  updatedKeys: Map<string, Set<String>>;
  noValidKeys: Set<string>;
  baselineStatuses: Map<string, BaselineValue>;

  constructor() {
    this.updatedKeys = new Map();
    this.noValidKeys = new Set();
    this.baselineStatuses = new Map();
  }

  toJson(): string {
    const updatedKeys = Array.from(this.updatedKeys.entries()).map((x) => {
      const [key, value] = x;
      return [key, Array.from(value)];
    });
    return JSON.stringify({
      updatedKeys: Object.fromEntries(updatedKeys),
      noValidKeys: Array.from(this.noValidKeys),
      baselineStatuses: Object.fromEntries(this.baselineStatuses.entries()),
    });
  }

  static fromJson(data: string): PreDistState {
    const obj = JSON.parse(data);
    console.log(obj);
    let rv = new PreDistState();
    rv.updatedKeys = new Map(
      Object.entries(obj.updatedKeys).map((entry) => {
        const [key, value] = entry;
        return [key, new Set(value as string[])];
      }),
    );
    rv.noValidKeys = new Set(obj.noValidKeys);
    rv.baselineStatuses = new Map(Object.entries(obj.baselineStatuses));
    return rv;
  }
}

function updateYamlStringOrSequence(
  doc: YAML.Document,
  key: string[],
  newValues: string[],
): boolean {
  const node = doc.getIn(key) as YAML.YAMLSeq | string | undefined;

  if (newValues.length === 0) {
    if (node !== undefined) {
      doc.deleteIn(key);
      return true;
    }
    return false;
  }

  if (newValues.length === 1) {
    if (newValues[0] !== node) {
      doc.setIn(key, newValues[0]);
      return true;
    }
    return false;
  }

  let seq: YAML.YAMLSeq;
  if (node === undefined || typeof node == "string") {
    seq = new YAML.YAMLSeq();
    doc.setIn(key, seq);
  } else {
    seq = node;
  }
  return updateYamlSequence(seq, newValues);
}

function updateYamlSequence(seq: YAML.YAMLSeq, newValues: string[]): boolean {
  let hasChanges = false;
  const currentItems = seq.items as YAML.Scalar<string>[];
  const newItems = currentItems.filter((item) =>
    newValues.includes(item.value),
  );
  if (newItems.length !== seq.items.length) {
    hasChanges = true;
  }
  const currentValues = new Set(currentItems.map((item) => item.value));

  newValues
    .filter((value) => !currentValues.has(value))
    .forEach((value) => {
      hasChanges = true;
      newItems.push(new YAML.Scalar(value));
    });
  seq.items = newItems;
  return hasChanges;
}

function loadSourceFiles(featuresDir: string): Map<string, SourceFile> {
  const sourceFiles = new Map();
  const pathIter = new fdir()
    .withBasePath()
    .filter((p) => p.endsWith(".yml"))
    .crawl(featuresDir)
    .sync();
  for (const path of pathIter) {
    const sourceFile = new SourceFile(path as string);
    sourceFiles.set(sourceFile.id, sourceFile);
  }
  return sourceFiles;
}

function loadDistFiles(featuresDir: string): Map<string, DistFile> {
  let distFiles = new Map();
  const pathIter = new fdir()
    .withBasePath()
    .filter((p) => p.endsWith(".yml.dist"))
    .crawl(featuresDir)
    .sync();
  for (const path of pathIter) {
    const distFile = new DistFile(path as string);
    distFiles.set(distFile.id, distFile);
  }
  return distFiles;
}

function allBCDKeys(): Set<string> {
  const keys = new Set<string>();
  for (const f of compat.walk()) {
    keys.add(f.id);
  }
  return keys;
}

const BASELINE_RANK: Record<string, number> = { false: 0, low: 1, high: 2 };

function baselineRank(v: BaselineValue): number {
  return BASELINE_RANK[String(v)] ?? 0;
}

/**
 * Compare two baseline snapshots and return regressions and improvements.
 */
export function compareBaseline(
  before: Map<string, BaselineValue>,
  after: Map<string, BaselineValue>,
): { regressions: BaselineChange[]; improvements: BaselineChange[] } {
  const regressions: BaselineChange[] = [];
  const improvements: BaselineChange[] = [];

  for (const [id, afterValue] of after) {
    const beforeValue = before.get(id) ?? false;
    const delta = baselineRank(afterValue) - baselineRank(beforeValue);
    if (delta < 0) {
      regressions.push({
        featureId: id,
        before: beforeValue,
        after: afterValue,
      });
    } else if (delta > 0) {
      improvements.push({
        featureId: id,
        before: beforeValue,
        after: afterValue,
      });
    }
  }

  regressions.sort((a, b) => a.featureId.localeCompare(b.featureId));
  improvements.sort((a, b) => a.featureId.localeCompare(b.featureId));

  return { regressions, improvements };
}

/**
 * Format a GitHub PR comment summarising BCD upgrade impacts.
 * Returns an empty string if there is nothing to report.
 */
export function formatComment(
  sourceChanges: PreDistState,
  regressions: BaselineChange[],
  improvements: BaselineChange[],
): string {
  if (
    sourceChanges.updatedKeys.size === 0 &&
    sourceChanges.noValidKeys.size === 0 &&
    regressions.length === 0 &&
    improvements.length === 0
  ) {
    return "";
  }

  const sections: string[] = [];

  if (sourceChanges.noValidKeys.size > 0) {
    sections.push(
      `### Features with no remaining BCD keys

The following features had all their BCD keys removed:
${Array.from(sourceChanges.noValidKeys)
  .map((item) => "* " + item)
  .join("\n")}

This must be resolved befire the update is merged.`,
    );
  }

  if (sourceChanges.updatedKeys.size > 0) {
    sections.push(
      `### Removed BCD keys

The following BCD keys were removed from web-features definitions:

| Feature | Removed keys |
| ------- | ------------ |
${[...sourceChanges.updatedKeys.entries()].map(([featureId, keys]) => `| ${featureId} | ${Array.from(keys).join("<br>")} |`).join("\n")}
`,
    );
  }

  if (regressions.length > 0) {
    sections.push(
      `### Baseline regressions

| Feature | Before | After |
| ------- | ------ | ----- |
${regressions.map(({ featureId, before, after }) => `| ${featureId} | ${before} | ${after} |`).join("\n")}
`,
    );
  }

  if (improvements.length > 0) {
    sections.push(
      `### Baseline improvements

| Feature | Before | After |
| ------- | ------ | ----- |
${improvements.map(({ featureId, before, after }) => `| ${featureId} | ${before} | ${after} |`).join("\n")}
`,
    );
  }

  return sections.join("\n\n");
}

// ---- CLI ----

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  yargs(process.argv.slice(2))
    .scriptName("bcd-upgrade")
    .usage("$0 <command>")
    .command(
      "pre-dist",
      "Find and remove deleted BCD keys; snapshot current baseline status",
      (y) =>
        y
          .option("features-dir", {
            type: "string",
            default: "features",
            describe: "Path to features directory",
          })
          .option("state-path", {
            type: "string",
            default: null,
            describe:
              "File to write pre-dist state (deletions, emptyFeatures) to",
          }),
      (argv) => {
        console.log(argv);
        const featuresDir = argv["features-dir"];
        const sourceFiles = loadSourceFiles(featuresDir);
        const distFiles = loadDistFiles(featuresDir);
        const bcdKeys = allBCDKeys();

        const state = new PreDistState();

        for (const [featureId, sourceFile] of sourceFiles.entries()) {
          const removedKeys = sourceFile.compatFeatures.difference(bcdKeys);
          if (removedKeys.size) {
            const newCompatFeatures = Array.from(
              sourceFile.compatFeatures,
            ).filter((item) => !removedKeys.has(item));
            const newComputeFrom =
              sourceFile.computeFrom.intersection(removedKeys).size > 0
                ? Array.from(sourceFile.computeFrom).filter(
                    (item) => !removedKeys.has(item),
                  )
                : null;
            state.updatedKeys.set(featureId, removedKeys);
            if (
              newCompatFeatures.length === 0 ||
              (newComputeFrom != null && newComputeFrom.length === 0)
            ) {
              state.noValidKeys.add(featureId);
            } else {
              logger.info(
                `Updating ${sourceFile.path} for removed keys`,
                removedKeys,
              );
              sourceFile.update(newCompatFeatures, newComputeFrom);
            }
          }
        }

        for (const [featureId, distFile] of distFiles) {
          state.baselineStatuses.set(featureId, distFile.status);
        }

        logger.info(argv["state-path"]);
        if (argv["state-path"] !== null) {
          fs.writeFileSync(argv["state-path"], state.toJson());
        } else {
          process.stdout.write(state.toJson());
        }

        const allRemovedKeys = new Set();
        for (const removedKeys of state.updatedKeys.values()) {
          for (const key of removedKeys) {
            allRemovedKeys.add(key);
          }
        }
        logger.info(
          "The following BCD keys used by web-features were removed:",
          Array.from(allRemovedKeys).sort(),
        );

        if (state.noValidKeys.size > 0) {
          logger.error(
            `The following feature(s) left with no valid BCD keys:
${Array.from(state.noValidKeys)
  .sort()
  .map(
    (id) =>
      `* ${id} - Depended on: ${Array.from(state.updatedKeys.get(id)).join(", ")}`,
  )
  .join("\n")}`,
          );
          process.exit(1);
        }
      },
    )
    .command(
      "post-dist",
      "Compare baseline before/after dist rebuild; print PR comment to stdout",
      (y) =>
        y
          .option("features-dir", {
            type: "string",
            default: "features",
            describe: "Path to features directory",
          })
          .option("state-path", {
            type: "string",
            default: null,
            describe: "File to read pre-dist state from",
          }),
      (argv) => {
        if (argv["state-path"] == null) {
          logger.error("Must provide --state-path");
          process.exit(1);
        }
        const featuresDir = argv["features-dir"];
        const distFiles = loadDistFiles(featuresDir);

        const sourceState: PreDistState = PreDistState.fromJson(
          fs.readFileSync(argv["state-path"], { encoding: "utf-8" }),
        );

        let baselineStatuses: Map<string, BaselineValue> = new Map();
        for (const [featureId, distFile] of distFiles) {
          baselineStatuses.set(featureId, distFile.status);
        }

        const { regressions, improvements } = compareBaseline(
          sourceState.baselineStatuses,
          baselineStatuses,
        );

        const comment = formatComment(sourceState, regressions, improvements);
        process.stdout.write(comment);
      },
    )
    .demandCommand(1, "Specify a subcommand: pre-dist or post-dist")
    .strict()
    .help()
    .parseSync();
}
