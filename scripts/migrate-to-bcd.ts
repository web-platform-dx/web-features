import fs from "node:fs";
import path from "node:path";

import { fdir } from "fdir";
import winston from "winston";
import yargs from "yargs";

import { features } from "../index.js";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: new winston.transports.Console(),
});

// Map from api.CoolThing.something to cool-thing
const bcdToFeature = new Map();

// Set of the first part of the BCD path encountered.
const bcdDirs = new Set();

for (const [feature, { compat_features }] of Object.entries(features)) {
  if (!compat_features) {
    continue;
  }
  for (const key of compat_features) {
    bcdToFeature.set(key, feature);
    bcdDirs.add(key.split(".")[0]);
  }
}

async function main(bcd_path) {
  const bcdJsons = new fdir()
    .withBasePath()
    .filter((fp) => {
      const dir = path.relative(bcd_path, fp).split(path.sep)[0];
      return bcdDirs.has(dir);
    })
    .filter((fp) => fp.endsWith(".json"))
    .crawl(bcd_path)
    .sync();

  function lookup(root, key) {
    const parts = key.split(".");
    let node = root;
    for (const part of parts) {
      if (Object.hasOwn(node, part)) {
        node = node[part];
      } else {
        return undefined;
      }
    }
    return node;
  }

  for (const fp of bcdJsons) {
    const src = fs.readFileSync(fp, { encoding: "utf-8" });
    const data = JSON.parse(src);
    let updated = false;
    for (const [key, feature] of bcdToFeature.entries()) {
      const node = lookup(data, key);
      if (!node || !node.__compat) {
        continue;
      }
      bcdToFeature.delete(key);

      const tag = `web-features:${feature}`;
      const compat = node.__compat;
      if (compat.tags?.includes(tag)) {
        continue;
      }

      while (true) {
        const index = compat.tags?.findIndex(
          (t) =>
            t.startsWith("web-features:") &&
            !t.startsWith("web-features:snapshot:"),
        );
        if (index === undefined || index === -1) {
          break;
        }

        // Remove any other feature tags (besides snapshots)
        // Compat keys in multiple web-features features creates ambiguity for some consumers, see https://github.com/web-platform-dx/web-features/issues/1173
        logger.info(`Removing tag ${compat.tags[index]} from ${key}`);
        compat.tags.pop(index);
      }

      logger.info(`Adding tag ${tag} to ${key}`);

      if (compat.tags) {
        compat.tags.push(tag);
      } else {
        compat.tags = [tag];
      }
      updated = true;
    }
    if (updated) {
      const src = JSON.stringify(data, null, "  ") + "\n";
      fs.writeFileSync(fp, src, { encoding: "utf-8" });
    }
  }

  for (const [key, feature] of bcdToFeature) {
    logger.warn("Not migrated:", feature, key);
  }
}

const argv = yargs(process.argv.slice(2))
  .scriptName("migrate-to-bcd")
  .usage("$0 <bcd-path>", "Migrate compat_features keys to BCD tags", (yargs) =>
    yargs.positional("bcd-path", {
      describe: "The path to the BCD folder",
    }),
  ).argv;

await main(argv.bcdPath);
