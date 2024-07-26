import { getStatus } from "compute-baseline";
import stringify from "fast-json-stable-stringify";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { basename } from "node:path";
import yargs from "yargs";
import * as data from "../index.js";

const rootDir = new URL("..", import.meta.url);

yargs(process.argv.slice(2))
  .scriptName("build")
  .command({
    command: "package",
    describe: "Generate the web-features npm package",
    handler: buildPackage,
  })
  .command({
    command: "extended-json",
    describe: "Generate a web-features JSON file with BCD per-key statuses",
    handler: buildExtendedJSON,
  })
  .parseSync();

function buildPackage() {
  const packageDir = new URL("./packages/web-features/", rootDir);
  const filesToCopy = ["LICENSE.txt", "types.ts", "schemas/data.schema.json"];

  const json = stringify(data);
  // TODO: Validate the resulting JSON against a schema.
  const path = new URL("data.json", packageDir);
  fs.writeFileSync(path, json);
  for (const file of filesToCopy) {
    fs.copyFileSync(
      new URL(file, rootDir),
      new URL(basename(file), packageDir),
    );
  }
  execSync("npm install", {
    cwd: "./packages/web-features",
    encoding: "utf-8",
  });
  execSync("npm run prepare", {
    cwd: "./packages/web-features",
    encoding: "utf-8",
  });
}

function buildExtendedJSON() {
  // TODO: Validate the resulting JSON against a schema.
  for (const [id, featureData] of Object.entries(data.features)) {
    if (Array.isArray(featureData.compat_features) && featureData.status) {
      const by_compat_key = {};

      for (const key of featureData.compat_features) {
        by_compat_key[key] = { status: getStatus(id, key) };
      }

      if (Object.keys(by_compat_key).length) {
        featureData.status.by_compat_key = by_compat_key;
      }
    }
  }

  fs.writeFileSync(
    new URL("./web-features.extended.json", rootDir),
    stringify(data),
  );
}
