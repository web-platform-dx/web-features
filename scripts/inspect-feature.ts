import { coreBrowserSet, getStatus } from "compute-baseline";
import escapeHtml from "escape-html";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import winston from "winston";
import YAML from "yaml";
import yargs from "yargs";
import { features } from "..";
import { defaultCompat } from "../packages/compute-baseline/dist/browser-compat-data/compat";
import { feature } from "../packages/compute-baseline/dist/browser-compat-data/feature";
import { SupportStatement } from "../packages/compute-baseline/dist/browser-compat-data/supportStatements";
import { convertHTML } from "../text";
import { FeatureData } from "../types";

interface Args {
  paths: string[];
  verbose: number;
}

const argv = yargs(process.argv.slice(2))
  .scriptName("dist")
  .usage("$0 [paths..]", "Inspect a .yml or .dist file", (yargs) =>
    yargs.positional("paths", {
      describe: "Directories or files to inspect.",
      default: ["features/a.yml"],
    }),
  )
  .option("verbose", {
    alias: "v",
    describe: "Show more detail",
    type: "count",
    default: 0,
    defaultDescription: "warn",
  }).argv as Args;

const logger = winston.createLogger({
  level: argv.verbose > 0 ? "debug" : "warn",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: new winston.transports.Console(),
});

function main(): void {
  for (const filePath of argv.paths) {
    const { name, ext, dir } = path.parse(filePath);
    const id = ext === ".dist" ? path.basename(name, ".yml") : name;

    const yamlFile = path.join(dir, `${id}.yml`);
    const distFile = `${yamlFile}.dist`;

    const feature = features[id];
    if (!feature) {
      throw new Error(`No feature found for ID ${id}`);
    }

    const { compat_features } = feature;

    console.log(`${escapeHtml(feature.name)} (${yamlFile}, ${distFile})\n`);

    // Iterate over the compat keys in the order given by the dist file
    const yml = YAML.parse(
      fs.readFileSync(distFile, { encoding: "utf-8" }),
    ) as Partial<FeatureData>;
    let compatKeys: string[];
    if (yml.compat_features?.length > 0) {
      compatKeys = yml.compat_features;
    } else if (compat_features && compat_features.length > 0) {
      compatKeys = compat_features;
    } else {
      compatKeys = [];
    }

    for (const compatKey of compatKeys) {
      const status = getStatus(id, compatKey);
      console.log(
        `- ${compatKey}${status.baseline ? ` (${status.baseline})` : ""}`,
      );
      for (const [browser, notes] of getNotes(compatKey, status).entries()) {
        console.log(`    - ${browser}`);
        for (const note of notes) {
          console.log(`      - ${convertHTML(note).text}`);
        }
      }
    }
  }
}

function getNotes(
  compatKey: string,
  status: ReturnType<typeof getStatus>,
): Map<string, string[]> {
  const browserNotes = new Map<string, string[]>();
  const f = feature(compatKey);
  for (const browserKey of coreBrowserSet) {
    const statements = f
      .supportStatements(defaultCompat.browser(browserKey))
      .filter(isEligibleStatement);
    for (const statement of statements) {
      const notes = Array.isArray(statement.data.notes!)
        ? statement.data.notes
        : [statement.data.notes];
      for (const note of notes) {
        browserNotes.set(statement.browser.id, [
          ...(browserNotes.get(statement.browser.id) ?? []),
          `${statement.partial_implementation ? `[partial_implementation] ` : ""}${statement.version_added}+: ${note}`,
        ]);
      }
    }
  }
  return browserNotes;
}

function isEligibleStatement(statement: SupportStatement): boolean {
  if (statement.version_added === false) {
    return false;
  }
  if (statement.version_removed) {
    return false;
  }
  if (statement.flags.length) {
    return false;
  }
  if (statement.data.alternative_name) {
    return false;
  }
  if (statement.data.prefix) {
    return false;
  }
  const { notes } = statement.data;
  if (notes === undefined) {
    return false;
  }
  if (notes.length === 0) {
    return false;
  }
  return true;
}

if (import.meta.url.startsWith("file:")) {
  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
  }
}
