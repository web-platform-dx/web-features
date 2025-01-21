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
import { checkForStaleCompat } from "./dist";

const compat = new Compat();

const argv = yargs(process.argv.slice(2))
  .scriptName("remove-tagged-compat-features")
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

  const compat_features = (source.contents as any).items.find(
    (p) => p.key.value === "compat_features",
  );

  if (compat_features) {
    const { key: keyData, value: data } = compat_features;
    const features = data.items.map((item) => item.value).sort();
    if (isDeepStrictEqual(features, taggedCompatFeatures)) {
      // Preserve comments around the compat_features key
      const comments = keyData.commentBefore ? [keyData.commentBefore] : [];
      data.items.reduce((acc, item) => {
        if (item.commentBefore) acc.push(item.commentBefore);
        if (item.comment) acc.push(item.comment);
        return acc;
      }, comments);
      if (data.commentBefore) comments.push(data.commentBefore);
      if (data.comment) comments.push(data.comment);
      if (comments.length) {
        source.comment = (source.comment || "") + comments.join("\n");
      }

      // Delete the key
      (source.contents as any).delete("compat_features");
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
