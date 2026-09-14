import { Temporal } from "@js-temporal/polyfill";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import type { Result } from "./stats.ts";

const argv = yargs(process.argv.slice(2))
  .scriptName("stats-report")
  .usage(
    "$0 <json>",
    "Print a pretty statistics report from the `stats.ts` script.",
  )
  .positional("json", {
    description:
      "The path to a JSON file from the stats script, or - to read from standard input.",
    coerce: (path: string | true) => {
      // yargs converts `-' to `true`
      if (path === "-" || path === true) {
        return JSON.parse(
          readFileSync("/dev/stdin", { encoding: "utf-8" }),
        ) as Result;
      } else if (typeof path === "string") {
        return JSON.parse(readFileSync(path, { encoding: "utf-8" })) as Result;
      }
      throw new Error(
        "Yargs shouldn't set this to false or undefined. If you're seeing this error, please file an issue.",
      );
    },
  })
  .parseSync();

function main() {
  const { json } = argv;
  if (!("change" in json)) {
    console.log(
      "This script requires stats JSON with data generated with the `--previous` or `--previous-release` options.",
    );
    process.exit(1);
  }
  console.log(report(json));
}

function report(stats: Result): string {
  const startDate = Temporal.Instant.from(
    stats.change.timestamp,
  ).toZonedDateTimeISO("Etc/UTC");
  const endDate = Temporal.Instant.from(stats.timestamp).toZonedDateTimeISO(
    "Etc/UTC",
  );
  const duration = endDate.since(startDate);
  const revisions = `[\`${stats.change.hash.slice(0, 8)}..${stats.hash.slice(0, 8)}\`](https://github.com/web-platform-dx/web-features/compare/${stats.change.hash}..${stats.hash})`;

  return [
    "### BCD coverage gap",
    "",
    "This shows feature entry coverage for fine-grained compatibility data. For unmapped keys, fewer is better.",
    "",
    reportCompatCoverage(stats, startDate, endDate),
    "",
    "### Cumulative shipping days",
    "",
    "This is is a time- and browser-weighted measure of unmapped BCD keys. The numbers grow for each day since a key first shipped, per browser. Smaller is better.",
    "",
    reportCumulativeShippingDays(stats),
    "",
    "### caniuse coverage gap",
    "",
    "This shows feature entry correspondence to independently-authored headline features on [caniuse.com](https://caniuse.com/). For unmapped IDs, fewer is better.",
    "",
    reportCaniuseCoverage(stats),
    "",
    `From ${formatDate(startDate)} to ${formatDate(endDate)} (${duration.days} days, ${revisions})`,
  ].join("\n");
}

function reportCompatCoverage(
  stats: Result,
  startDate: Temporal.ZonedDateTime,
  endDate: Temporal.ZonedDateTime,
): string {
  const headers = [
    "Comapt keys",
    `Before (${formatDate(startDate)})`,
    `After (${formatDate(endDate)})`,
    "Change (abs.)",
    "Change (%)",
  ];
  const alignment = ["left", "right", "right", "right", "right"];
  const rows: [string, string, string, string, string][] = [
    [
      "BCD excluding `webextensions.*`",
      formatInteger(stats.compatKeysCount - stats.change.compatKeysCount),
      formatInteger(stats.compatKeysCount),
      formatInteger(stats.change.compatKeysCount),
      formatPercentage(
        (stats.change.compatKeysCount / stats.compatKeysCount) * 100,
      ),
    ],
    [
      "All unmapped by web-features",
      formatInteger(
        stats.unmappedCompatKeysCount - stats.change.unmappedCompatKeysCount,
      ),
      formatInteger(stats.unmappedCompatKeysCount),
      formatInteger(stats.change.unmappedCompatKeysCount),
      formatPercentage(
        (stats.change.unmappedCompatKeysCount / stats.unmappedCompatKeysCount) *
          100,
      ),
    ],
    [
      "Normal unmapped",
      formatInteger(
        stats.unmappedNormalCompatKeysCount -
          stats.change.unmappedNormalCompatKeysCount,
      ),
      formatInteger(stats.unmappedNormalCompatKeysCount),
      formatInteger(stats.change.unmappedNormalCompatKeysCount),
      formatPercentage(
        (stats.change.unmappedNormalCompatKeysCount /
          stats.unmappedNormalCompatKeysCount) *
          100,
      ),
    ],
    [
      "Deprecated or non-standard unmapped",
      formatInteger(
        stats.unmappedDiscourageableCompatKeysCount -
          stats.change.unmappedDiscourageableCompatKeysCount,
      ),
      formatInteger(stats.unmappedDiscourageableCompatKeysCount),
      formatInteger(stats.change.unmappedDiscourageableCompatKeysCount),
      formatPercentage(
        (stats.change.unmappedDiscourageableCompatKeysCount /
          stats.unmappedDiscourageableCompatKeysCount) *
          100,
      ),
    ],
  ];

  const head = [arrayToTableRow(headers), alignTable(alignment)].join("\n");
  const body = rows.map(arrayToTableRow).join("\n");
  return [head, body].join("\n");
}

function reportCumulativeShippingDays(stats: Result): string {
  const headers = [
    "Cumulative shipping days",
    "Before",
    "After",
    "Change (abs.)",
    "Change (%)",
  ];
  const alignment = ["left", "right", "right", "right", "right"];
  const rows: [string, string, string, string, string][] = [
    [
      "All unmapped by web-features",
      formatInteger(
        stats.unmappedCompatKeysCumulativeShippingDays -
          stats.change.unmappedCompatKeysCumulativeShippingDays,
      ),
      formatInteger(stats.unmappedCompatKeysCumulativeShippingDays),
      formatInteger(stats.change.unmappedCompatKeysCumulativeShippingDays),
      formatPercentage(
        (stats.change.unmappedCompatKeysCumulativeShippingDays /
          stats.unmappedCompatKeysCumulativeShippingDays) *
          100,
      ),
    ],
    [
      "Normal unmapped",
      formatInteger(
        stats.unmappedNormalCompatKeysCumulativeShippingDays -
          stats.change.unmappedNormalCompatKeysCumulativeShippingDays,
      ),
      formatInteger(stats.unmappedNormalCompatKeysCumulativeShippingDays),
      formatInteger(
        stats.change.unmappedNormalCompatKeysCumulativeShippingDays,
      ),
      formatPercentage(
        (stats.change.unmappedNormalCompatKeysCumulativeShippingDays /
          stats.unmappedNormalCompatKeysCumulativeShippingDays) *
          100,
      ),
    ],
    [
      "Deprecated or non-standard unmapped",
      formatInteger(
        stats.unmappedDiscourageableCompatKeysCumulativeShippingDays -
          stats.change.unmappedDiscourageableCompatKeysCumulativeShippingDays,
      ),
      formatInteger(
        stats.unmappedDiscourageableCompatKeysCumulativeShippingDays,
      ),
      formatInteger(
        stats.change.unmappedDiscourageableCompatKeysCumulativeShippingDays,
      ),
      formatPercentage(
        (stats.change.unmappedDiscourageableCompatKeysCumulativeShippingDays /
          stats.unmappedDiscourageableCompatKeysCumulativeShippingDays) *
          100,
      ),
    ],
  ];

  const head = [arrayToTableRow(headers), alignTable(alignment)].join("\n");
  const body = rows.map(arrayToTableRow).join("\n");
  return [head, body].join("\n");
}

function reportCaniuseCoverage(stats: Result): string {
  const headers = [
    "caniuse IDs",
    "Before",
    "After",
    "Change (abs.)",
    "Change (%)",
  ];
  const alignment = ["left", "right", "right", "right", "right"];
  const rows: [string, string, string, string, string][] = [
    [
      "All",
      formatInteger(
        stats.caniuseIdsCount - stats.change.unmappedCaniuseIdsCount,
      ),
      formatInteger(stats.caniuseIdsCount),
      formatInteger(stats.change.unmappedCaniuseIdsCount),
      formatPercentage(
        (stats.change.caniuseIdsCount / stats.caniuseIdsCount) * 100,
      ),
    ],
    [
      "Unmapped by web-features",
      formatInteger(
        stats.unmappedCaniuseIdsCount - stats.change.unmappedCaniuseIdsCount,
      ),
      formatInteger(stats.unmappedCaniuseIdsCount),
      formatInteger(stats.change.unmappedCaniuseIdsCount),
      formatPercentage(
        (stats.change.unmappedCaniuseIdsCount / stats.unmappedCaniuseIdsCount) *
          100,
      ),
    ],
  ];

  const head = [arrayToTableRow(headers), alignTable(alignment)].join("\n");
  const body = rows.map(arrayToTableRow).join("\n");
  return [head, body].join("\n");
}

function formatDate(date: Temporal.ZonedDateTime): string {
  return date.toPlainDate().toString();
}

function formatInteger(n: number): string {
  return Intl.NumberFormat("en-US", {
    useGrouping: "always",
  })
    .format(n)
    .replaceAll(",", "&#x202F;");
}

function formatPercentage(n: number): string {
  return (
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: "always",
    })
      .format(n)
      .replaceAll(",", "&#x202F;") + "%"
  );
}

function arrayToTableRow(arr: (string | number)[]): string {
  return `| ${arr.join(" | ")} |`;
}

function alignTable(arr: string[]): string {
  return (
    "| " +
    arr
      .map((a) => {
        if (a === "left") {
          return ":---";
        } else if (a === "center") {
          return ":---:";
        } else if (a === "right") {
          return "---:";
        } else {
          return "---";
        }
      })
      .join(" | ") +
    " |"
  );
}

if (import.meta.url.startsWith("file:")) {
  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
  }
}
