import { Compat, type Feature } from "compute-baseline/browser-compat-data";
import fs from "node:fs";

interface Logger {
  debug?: typeof console.debug;
  info?: typeof console.info;
  log?: typeof console.log;
  warn?: typeof console.warn;
  error?: typeof console.error;
}

/**
 * Check that the installed @mdn/browser-compat-data (BCD) package matches the
 * one pinned in `package.json`. BCD updates frequently, leading to surprising
 * error messages if you haven't run `npm install` recently.
 */
export function checkForStaleCompat(logger: Logger): void {
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

const compat = new Compat();

export const tagsToFeatures: Map<string, Feature[]> = (() => {
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
