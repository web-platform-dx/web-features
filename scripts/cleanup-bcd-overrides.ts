import { setLogger } from "compute-baseline";
import { Compat, Feature } from "compute-baseline/browser-compat-data";
import { fdir } from "fdir";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import winston from "winston";
import YAML from "yaml";
import yargs from "yargs";
import {checkForStaleCompat} from "./dist.ts";

const compat = new Compat();

const argv = yargs(process.argv.slice(2))
  .scriptName("cleanup-bcd-overrides")
  .usage(
    "$0 [paths..]",
    "Remove `compat_features` from `.yml` files that have an equivalently tagged set of features in @mdn/browser-compat-data",
    (yargs) =>
      yargs.positional("paths", {
        describe: "Directories or files to check/update.",
        default: ["features"],
      }),
  ).argv;

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

function cleanup(sourcePath: string): void {
  const source = YAML.parseDocument(
    fs.readFileSync(sourcePath, { encoding: "utf-8" }),
  );
  const { name: id } = path.parse(sourcePath);

  // Collect tagged compat features. A `compat_features` list in the source
  // takes precedence, but can be removed if it matches the tagged features.
  const taggedCompatFeatures = (tagsToFeatures.get(`web-features:${id}`) ?? [])
    .map((f) => `${f.id}`)
    .sort();

  const data = source.contents.get("compat_features");

  if (data) {
    const features = data.items.map((item) => item.value).sort();
    if (isDeepStrictEqual(features, taggedCompatFeatures)) {
      if (data.commentBefore) {
        source.comment = data.commentBefore;
      }
      source.contents.delete("compat_features");
      fs.writeFileSync(sourcePath, source.toString({ lineWidth: 0 }));
      logger.info(`${id}: removed compat_features in favor of tag`);
    }
  }
}

function main() {
  const filePaths: string[] = argv.paths.flatMap((fileOrDirectory) => {
    if (fs.statSync(fileOrDirectory).isDirectory()) {
      return new fdir()
        .withBasePath()
        .filter((path) => path.endsWith(".yml"))
        .crawl(fileOrDirectory)
        .sync();
    }
    return fileOrDirectory.endsWith(".yml") ? fileOrDirectory : [];
  });

  for (const sourcePath of filePaths) {
    cleanup(sourcePath);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkForStaleCompat();
  main();
  process.exit(exitStatus);
}
