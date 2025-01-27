import yargs from "yargs";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const argv = yargs(process.argv.slice(2))
  .scriptName("undist")
  .usage("$0 path", "Generate .yml from .yml.dist", (yargs) =>
    yargs.positional("path", {
      type: "string",
      describe: "Path to feature.yml.dist file",
      demandOption: true,
    }),
  )
  .option("add", {
    alias: "a",
    type: "array",
    describe: "BCD keys to add to the feature.yml file",
  })
  .option("sort", {
    alias: "s",
    type: "boolean",
    default: true,
    describe: "Sort the compat_features array",
  }).argv;

// Support `path/to/feature.yml.dist`, `path/to/feature.yml`, or `path/to/feature`
function getPaths(featurePath: string): { yml: string; dist: string } {
  const { name, ext, dir } = path.parse(featurePath);
  const id = ext === ".dist" ? path.basename(name) : `${name}.yml`;

  return {
    yml: path.join(dir, id),
    dist: path.join(dir, `${id}.dist`),
  };
}

async function main() {
  const { path, sort, add = [] } = argv;

  const { yml, dist } = getPaths(path);

  // Load and parse the .yml file
  const ymlContents = fs.readFileSync(yml, { encoding: "utf-8" });
  const ymlData = YAML.parseDocument(ymlContents);

  // Assert 'compat_features' doesn't already exist
  if (ymlData && ymlData.has("compat_features")) {
    throw new Error(
      `The key 'compat_features' is already present in the file ${yml}`,
    );
  }

  // Load and parse the .dist.yml file
  const distContents = fs.readFileSync(dist, { encoding: "utf-8" });
  const distData = YAML.parse(distContents);

  const compatFeatures = distData.compat_features;
  if (!compatFeatures) {
    throw new Error(`No 'compat_features' found in ${dist}`);
  }
  if (add.length > 0) {
    compatFeatures.push(...add);
  }

  if (sort) {
    compatFeatures.sort();
  }
  ymlData.set("compat_features", compatFeatures);

  fs.writeFileSync(yml, ymlData.toString({ lineWidth: 0 }));
  console.log(`Added keys to ${yml}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
