import { DefinedError } from "ajv";
import { getStatus } from "compute-baseline";
import stringify from "fast-json-stable-stringify";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { basename } from "node:path";
import winston from "winston";
import yargs from "yargs";
import * as data from "../index.js";
import { FeatureData } from "../types.js";
import { validate } from "./validate.js";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: new winston.transports.Console(),
});

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

  if (!valid(data)) {
    logger.error("Data failed schema validation. No package built.");
    process.exit(1);
  }

  const json = stringify(data);
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
  for (const [id, featureData] of Object.entries(data.features)) {
    if (Array.isArray(featureData.compat_features) && featureData.status) {
      const by_compat_key: FeatureData["status"]["by_compat_key"] = {};

      for (const key of featureData.compat_features) {
        by_compat_key[key] = getStatus(id, key);
      }

      if (Object.keys(by_compat_key).length) {
        featureData.status.by_compat_key = by_compat_key;
      }
    }
  }

  if (!valid(data)) {
    logger.error("Data failed schema validation. No JSON file written.");
    process.exit(1);
  }

  fs.writeFileSync(
    new URL("./web-features.extended.json", rootDir),
    stringify(data),
  );
}

function valid(data: any): boolean {
  const valid = validate(data);
  if (!valid) {
    // TODO: turn on strictNullChecks, fix all the errors, and replace this with:
    // const errors = validate.errors;
    const errors = (valid as any).errors as DefinedError[];
    for (const error of errors) {
      logger.error(`${error.instancePath}: ${error.message}`);
    }
    return false;
  }
  return true;
}
