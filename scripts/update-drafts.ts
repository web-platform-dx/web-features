import { Compat } from "compute-baseline/browser-compat-data";
import * as diff from "diff";
import { fdir } from "fdir";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Path from "path";
import webSpecs from "web-specs" assert { type: "json" };
import winston from "winston";
import { Document } from "yaml";
import yargs from "yargs";

import { features } from "../index.js";

type WebSpecsSpec = (typeof webSpecs)[number];

const argv = yargs(process.argv.slice(2))
  .scriptName("update-drafts")
  .usage("$0", "Update draft features with BCD keys mentioned in specs.")
  .option("keys", {
    type: "array",
    describe: "Keys to match",
  })
  .option("paths", {
    type: "array",
    describe: "Draft feature files to update",
  })
  .option("verbose", {
    alias: "v",
    describe: "Show more information about what files are modified",
    type: "count",
    default: 0,
    defaultDescription: "warn",
  }).argv;

const logger = winston.createLogger({
  level: argv.verbose > 0 ? "debug" : "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: new winston.transports.Console(),
});

function* getPages(spec): Generator<string> {
  yield spec.url;
  if (spec.nightly?.url) {
    yield spec.nightly.url;
  }
  if (spec.nightly?.pages) {
    yield* spec.nightly.pages;
  }
}

function normalize(page: string) {
  const url = new URL(page);
  // Remove any fragment.
  url.hash = "";
  // Collapse HTML and ECMA-262 multipage into a single canonical page.
  const multipageIndex = url.pathname.indexOf("/multipage/");
  if (multipageIndex !== -1) {
    url.pathname = url.pathname.substring(0, multipageIndex + 1);
  }
  // Strip levels from CSS specs.
  if (url.hostname.startsWith("drafts.")) {
    url.pathname = url.pathname.replace(/-\d+\/$/, "/");
  }
  return String(url);
}

function formatIdentifier(s: string): string {
  return s
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .join("-");
}

async function main() {
  const { keys: filterKeys, paths: filterPaths } = argv;

  const compat = new Compat();

  // Build a map of used BCD keys to feature.
  const webFeatures = new Map<string, string>();
  Object.values(features).map((data) => {
    if (data.compat_features) {
      for (const compatFeature of data.compat_features) {
        webFeatures.set(compatFeature, data.name);
      }
    }
  });

  // Build a map from URLs to spec.
  const pageToSpec = new Map<string, WebSpecsSpec>();

  let selectedSpecs = webSpecs;
  let selectedKeys = filterKeys ?? [];

  if (filterPaths?.length) {
    const filePaths = filterPaths.flatMap((fileOrDirectory) => {
      if (fsSync.statSync(fileOrDirectory).isDirectory()) {
        return new fdir()
          .withBasePath()
          .filter((fp) => fp.endsWith(".yml"))
          .crawl(fileOrDirectory)
          .sync();
      }
      return fileOrDirectory;
    });
    selectedKeys.push(...filePaths.map((fp) => Path.parse(fp).name));
  }

  if (selectedKeys?.length) {
    selectedSpecs = selectedSpecs.filter((ws) =>
      selectedKeys.some((selectedKey) => ws.shortname.includes(selectedKey)),
    );
  }

  for (const spec of selectedSpecs) {
    for (const page of getPages(spec)) {
      pageToSpec.set(normalize(page), spec);
    }
  }

  // Iterate BCD and group compat features by spec.
  const specToCompatFeatures = new Map<WebSpecsSpec, Set<string>>();
  for (const feature of compat.walk()) {
    // Skip deprecated and non-standard features.
    if (feature.deprecated || !feature.standard_track) {
      continue;
    }

    // A few null values remain in BCD. They are being removed in
    // https://github.com/mdn/browser-compat-data/pull/23774.
    // TODO: Remove this workaround when BCD is free or true/null values.
    if (feature.id.startsWith("html.manifest.")) {
      continue;
    }

    const spec_url = feature.data.__compat.spec_url;
    if (!spec_url) {
      continue;
    }

    for (const url of feature.spec_url) {
      const spec = pageToSpec.get(normalize(url));
      if (!spec) {
        if (!selectedKeys) console.warn(`${url} not matched to any spec`);
        continue;
      }
      const keys = specToCompatFeatures.get(spec);
      if (keys) {
        keys.add(feature.id);
      } else {
        specToCompatFeatures.set(spec, new Set([feature.id]));
      }
    }
  }

  // Separate out features that are already part of web-features.
  for (const [spec, compatFeatures] of specToCompatFeatures.entries()) {
    const usedFeatures = new Map<string, Set<String>>();
    for (const key of compatFeatures) {
      if (webFeatures.has(key)) {
        const feature = webFeatures.get(key);
        if (usedFeatures.has(feature)) {
          usedFeatures.get(feature).add(key);
        } else {
          usedFeatures.set(feature, new Set([key]));
        }
        compatFeatures.delete(key);
      }
    }

    // If all features are already part of web-features, skip this spec.
    if (compatFeatures.size === 0) {
      continue;
    }

    // Write out draft feature per spec.
    const id = formatIdentifier(spec.shortname);

    const feature = new Document({
      draft_date: new Date().toISOString().substring(0, 10),
      name: spec.title,
      description: "TODO",
      spec: spec.nightly?.url ?? spec.url,
      compat_features: Array.from(compatFeatures).sort(),
    });

    if (usedFeatures.size > 0) {
      let usedFeaturesComment = ` The following features in the spec are already part of web-features:\n`;
      for (const [feature, keys] of usedFeatures.entries()) {
        usedFeaturesComment += ` - ${feature}:\n   - ${Array.from(keys).join("\n   - ")}\n`;
      }

      feature.comment = usedFeaturesComment.trimEnd();
    }

    const destination = `features/draft/spec/${id}.yml`;
    const proposedFile = feature.toString();

    let originalFile: string;
    try {
      originalFile = await fs.readFile(destination, { encoding: "utf-8" });
    } catch (err: unknown) {
      // If there's no file for this spec already, write a new one immediately.
      if (typeof err === "object" && "code" in err && err.code === "ENOENT") {
        await fs.writeFile(destination, proposedFile);
        logger.info(`${destination}: new spec file added`);
        continue;
      }
      throw err;
    }

    // If there's a file for this spec already, write updates only if something
    // other than the `draft_date` changed. Because changes can be comments, we
    // have to check a diff rather than parsing and comparing values.
    const changes = diff.diffLines(originalFile, proposedFile);
    const noChanges =
      changes.length === 1 && !changes[0].added && !changes[0].removed;
    const onlyDateChanges =
      !noChanges &&
      changes.length === 3 &&
      changes
        .filter((change) => change.added || change.removed)
        .every((change) => change.value.includes("draft_date: "));

    if (noChanges || onlyDateChanges) {
      logger.debug(`${destination}: no changes, skipped`);
      continue;
    }

    await fs.writeFile(destination, proposedFile);
    logger.info(`${destination}: updated`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
