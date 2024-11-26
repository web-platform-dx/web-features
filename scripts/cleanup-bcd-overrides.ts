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

/**
 * Check that the installed @mdn/browser-compat-data (BCD) package matches the
 * one pinned in `package.json`. BCD updates frequently, leading to surprising
 * error messages if you haven't run `npm install` recently.
 */
function checkForStaleCompat(): void {
  const packageBCDVersionSpecifier: string = (() => {
    const packageJSON: unknown = JSON.parse(
      fs.readFileSync(process.env.npm_package_json, {
        encoding: "utf-8",
      }),
    );
    if (typeof packageJSON === "object" && "devDependencies" in packageJSON) {
      const bcd = packageJSON.devDependencies["@mdn/browser-compat-data"];
      if (typeof bcd === "string") {
        return bcd;
      }
      throw new Error(
        "@mdn/browser-compat-data version not found in package.json",
      );
    }
  })();
  const installedBCDVersion = compat.version;

  if (!packageBCDVersionSpecifier.includes(installedBCDVersion)) {
    logger.error(
      `Installed @mdn/browser-compat-data (${installedBCDVersion}) does not match package.json version (${packageBCDVersionSpecifier})`,
    );
    logger.error("Run `npm install` and try again.");
    process.exit(1);
  }
}

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
