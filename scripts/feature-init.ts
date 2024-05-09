// This script helps you start writing a new feature YAML file.
// To get started, run: `npm run --silent feature-init -- --help`

import fs from "node:fs/promises";
import { fileURLToPath } from "url";

import * as prettier from "prettier";
import { stringify } from "yaml";
import yargs from "yargs";

const argv = yargs(process.argv.slice(2))
  .scriptName("feature-init")
  .usage("$0 <feature-identifier>", "Start a new feature YAML file", (yargs) =>
    yargs.positional("feature-identifier", {
      describe: "the feature key (i.e., the filename without `.yml`)",
    }),
  )
  .option("dry-run", {
    alias: "n",
    boolean: true,
    default: false,
    describe: "Print instead of writing to a file",
  })
  .option("name", {
    type: "string",
    demandOption: true,
    default: "",
    describe: "A human-readable name for the feature",
  })
  .option("caniuse", {
    type: "string",
    demandOption: true,
    default: "",
    describe: "Set the Can I use…? ID",
  })
  .option("compat-features", {
    alias: "compat",
    type: "array",
    demandOption: true,
    default: [],
    describe: "A BCD key. Can be used multiple times.",
  })
  .option("spec", {
    demandOption: true,
    default: "",
    describe: "A specification URL. Can be used multiple times.",
  }).argv;

async function main() {
  const { dryRun, featureIdentifier, name, caniuse, compatFeatures, spec } =
    argv;

  const destination = identifierToPath(featureIdentifier);
  const content = {
    name,
    spec,
    caniuse,
    compat_features: compatFeatures,
  };

  const yamlText = stringify(content);
  const formatted = await format(destination, yamlText);

  if (dryRun) {
    console.log(formatted);
    process.exit(0);
  }
  await fs.writeFile(destination, formatted);
}

async function format(featurePath: string, text: string): Promise<string> {
  const configPath = fileURLToPath(new URL("../.prettierrc", import.meta.url));
  const options = await prettier.resolveConfig(configPath);
  options.filepath = featurePath;
  return prettier.format(text, options);
}

function identifierToPath(identifier: string): string {
  return fileURLToPath(
    new URL(`../features/${identifier}.yml`, import.meta.url),
  );
}

await main();
