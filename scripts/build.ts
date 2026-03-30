import { DefinedError } from "ajv";
import stringify from "fast-json-stable-stringify";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import yargs from "yargs";
import * as data from "../index.js";
import { validate, validateProposed } from "./validate.js";
import { fdir } from "fdir";
import YAML from "yaml";

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
  .parseSync();

function buildPackage() {
  const packageDir = new URL("./packages/web-features/", rootDir);
  const filesToCopy = [
    "LICENSE.txt",
    "types.quicktype.ts",
    "types.ts",
    "schemas/data.schema.json",
  ];

  if (!valid(data)) {
    logger.error("Data failed schema validation. No package built.");
    process.exit(1);
  }

  const json = stringify(data);
  const dataPath = new URL("data.json", packageDir);
  fs.writeFileSync(dataPath, json);

  // TODO: Remove the extended data artifact in the next major release.
  const extendedPath = new URL("data.extended.json", rootDir);
  fs.writeFileSync(extendedPath, json);

  const proposedPath = new URL("data.proposed.json", rootDir);
  const proposedData = buildProposed();
  if (!validProposed(proposedData)) {
    logger.error("Proposed data failed schema validation. No package built.");
    process.exit(1);
  }
  fs.writeFileSync(proposedPath, stringify(proposedData));

  for (const file of filesToCopy) {
    fs.copyFileSync(
      new URL(file, rootDir),
      new URL(path.basename(file), packageDir),
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

function valid(data: any): boolean {
  const valid = validate(data);
  if (!valid) {
    // TODO: turn on strictNullChecks, fix all the errors, and replace this with:
    // const errors = validate.errors;
    const errors = validate.errors as DefinedError[];
    for (const error of errors) {
      logger.error(`${error.instancePath}: ${error.message}`);
    }
    return false;
  }
  return true;
}

function buildProposed() {
  const features: any = {};
  const filePaths = new fdir()
    .withBasePath()
    .filter((fp) => fp.endsWith(".yml"))
    .crawl("features/draft/proposed")
    .sync() as string[];
  for (const fp of filePaths) {
    const { name: key } = path.parse(fp);
    let data;
    try {
      data = YAML.parse(fs.readFileSync(fp, { encoding: "utf-8" }));
    } catch {
      console.warn(`${fp} is not a valid YAML file. Skipping.`);
      continue;
    }
    if (data.kind === undefined) {
      data.kind = "proposed";
    } else if (!["proposed", "moved", "split"].includes(data.kind)) {
      console.log(`${fp} uses an unexpected kind ${JSON.stringify(data.kind)}. Skipping.`);
      continue;
    }
    features[key] = data;
  }
  const proposed = { features };
  return proposed;
}

function validProposed(data: any): boolean {
  const valid = validateProposed(data);
  if (!valid) {
    // TODO: turn on strictNullChecks, fix all the errors, and replace this with:
    // const errors = validate.errors;
    const errors = validate.errors as DefinedError[];
    for (const error of errors) {
      logger.error(`${error.instancePath}: ${error.message}`);
    }
    return false;
  }
  return true;
}
