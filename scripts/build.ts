import { execSync } from "child_process";
import stringify from "fast-json-stable-stringify";
import fs from "fs";
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
  const filesToCopy = ["LICENSE.txt", "types.ts"];

  const json = stringify(data);
  // TODO: Validate the resulting JSON against a schema.
  const path = new URL("index.json", packageDir);
  fs.writeFileSync(path, json);
  for (const file of filesToCopy) {
    fs.copyFileSync(new URL(file, rootDir), new URL(file, packageDir));
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
