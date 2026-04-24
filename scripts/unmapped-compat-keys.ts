import { Temporal } from "@js-temporal/polyfill";
import { coreBrowserSet } from "compute-baseline";
import { Compat, Feature } from "compute-baseline/browser-compat-data";
import { fileURLToPath } from "node:url";
import winston from "winston";
import yargs from "yargs";
import { features } from "../index.js";
import { support } from "../packages/compute-baseline/dist/baseline/support.js";
import { isOrdinaryFeatureData } from "../type-guards.js";

const defaultLogLevel = "warn";
const today = Temporal.Now.plainDateISO();

const compat = new Compat();

const logger = winston.createLogger({
  level: defaultLogLevel,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: new winston.transports.Console(),
});

const mappedCompatKeys = (() => {
  return new Set(
    Object.values(features).flatMap((f) => {
      if (isOrdinaryFeatureData(f)) {
        return f.compat_features ?? [];
      }
      return [];
    }),
  );
})();

/**
 * Get a map of each compat key to the sum of days that key has been shipping.
 */
export function compatFeaturesToCumulativeDaysShipped(): Map<Feature, number> {
  const map = new Map();
  for (const f of compat.walk()) {
    if (f.id.startsWith("webextensions")) {
      continue;
    }
    if (mappedCompatKeys.has(f.id)) {
      logger.debug(`${f.id} skipped, already mapped to a feature`);
      continue;
    }

    map.set(f, cumulativeDaysShipped(f));
  }
  return map;
}

/**
 * Returns the sum of days that this compat key has been shipping in each
 * browser in the Baseline core browser set.
 *
 * Like the Baseline calculation, this excludes features that are partially
 * implemented, prefixed, behind flags, or in not-yet-stable releases.
 *
 * @param {Feature} feature a compat feature object
 * @return {number} an integer
 */
function cumulativeDaysShipped(feature: Feature) {
  const browsers = coreBrowserSet.map((b) => compat.browser(b));
  const results = support(feature, browsers);
  return [...results.values()]
    .filter((r) => r !== undefined)
    .map(
      (r) =>
        r.release.date.until(today, {
          largestUnit: "days",
          smallestUnit: "days",
        }).days,
    )
    .reduce((prev, curr) => prev + curr, 0);
}

function main() {
  const argv = yargs(process.argv.slice(2))
    .scriptName("unmapped-compat-keys")
    .usage(
      "$0",
      "Print keys from mdn/browser-compat-data not assigned to a feature",
    )
    .option("format", {
      choices: ["json", "yaml"],
      default: "yaml",
      describe:
        "Choose the output format. JSON has more detail, while YAML is suited to pasting into feature files.",
    })
    .option("verbose", {
      alias: "v",
      describe: "Show more information",
      type: "count",
      default: 0,
      defaultDescription: "warn",
    })
    .parseSync();

  logger.transports[0].level = argv.verbose > 0 ? "debug" : "warn";

  const byAge = [...compatFeaturesToCumulativeDaysShipped().entries()].sort(
    ([, aDays], [, bDays]) => aDays - bDays,
  );

  if (argv.format === "yaml") {
    for (const [f] of byAge) {
      console.log(`  - ${f.id}`);
    }
  }

  if (argv.format === "json") {
    console.log(
      JSON.stringify(
        byAge.map(([f, days]) => ({
          key: f.id,
          cumulativeDaysShipped: days,
          deprecated: f.deprecated,
        })),
        undefined,
        2,
      ),
    );
  }
}

if (import.meta.url.startsWith("file:")) {
  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
  }
}
