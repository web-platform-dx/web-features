import { DefinedError } from "ajv";
import stringify from "fast-json-stable-stringify";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { basename } from "node:path";
import winston from "winston";
import yargs from "yargs";
import * as data from "../index.js";
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
  const path = new URL("data.json", packageDir);
  fs.writeFileSync(path, json);

  // TODO: Remove the extended data artifact in the next major release.
  const extendedPath = new URL("data.extended.json", rootDir);
  fs.writeFileSync(extendedPath, json);

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
