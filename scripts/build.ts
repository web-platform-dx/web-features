import { basename } from "node:path";
import { execSync } from "node:child_process";
import fs from "node:fs";
import stringify from "fast-json-stable-stringify";
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
