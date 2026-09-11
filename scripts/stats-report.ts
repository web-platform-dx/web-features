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
  const revisions = `${stats.change.hash}..${stats.hash}`;

  return [
    "### BCD coverage",
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
    "### caniuse coverage",
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
    "",
    `Before (${formatDate(startDate)})`,
    `After (${formatDate(endDate)})`,
    "Net",
  ];
  const alignment = ["left", "right", "right", "right"];
  const rows: [string, number, number, number][] = [
    [
      "BCD keys",
      stats.compatKeysCount - stats.change.compatKeysCount,
      stats.compatKeysCount,
      stats.change.compatKeysCount,
    ],
    [
      "All keys unmapped",
      stats.unmappedCompatKeysCount - stats.change.unmappedCompatKeysCount,
      stats.unmappedCompatKeysCount,
      stats.change.unmappedCompatKeysCount,
    ],
    [
      "Normal keys unmapped",
      stats.unmappedNormalCompatKeysCount -
        stats.change.unmappedNormalCompatKeysCount,
      stats.unmappedNormalCompatKeysCount,
      stats.change.unmappedNormalCompatKeysCount,
    ],
    [
      "Deprecated or non-standard keys unmapped",
      stats.unmappedDiscourageableCompatKeysCount -
        stats.change.unmappedDiscourageableCompatKeysCount,
      stats.unmappedDiscourageableCompatKeysCount,
      stats.change.unmappedDiscourageableCompatKeysCount,
    ],
  ];

  const head = [arrayToTableRow(headers), alignTable(alignment)].join("\n");
  const body = rows.map(arrayToTableRow).join("\n");
  return [head, body].join("\n");
}

function reportCumulativeShippingDays(stats: Result): string {
  const headers = ["Cumulative shipping days", "Before", "After", "Net"];
  const alignment = ["left", "right", "right", "right"];
  const rows: [string, number, number, number][] = [
    [
      "All keys unmapped",
      stats.unmappedCompatKeysCumulativeShippingDays -
        stats.change.unmappedCompatKeysCumulativeShippingDays,
      stats.unmappedCompatKeysCumulativeShippingDays,
      stats.change.unmappedCompatKeysCumulativeShippingDays,
    ],
    [
      "Normal keys unmapped",
      stats.unmappedNormalCompatKeysCumulativeShippingDays -
        stats.change.unmappedNormalCompatKeysCumulativeShippingDays,
      stats.unmappedNormalCompatKeysCumulativeShippingDays,
      stats.change.unmappedNormalCompatKeysCumulativeShippingDays,
    ],
    [
      "Deprecated or non-standard keys unmapped",
      stats.unmappedDiscourageableCompatKeysCumulativeShippingDays -
        stats.change.unmappedDiscourageableCompatKeysCumulativeShippingDays,
      stats.unmappedDiscourageableCompatKeysCumulativeShippingDays,
      stats.change.unmappedDiscourageableCompatKeysCumulativeShippingDays,
    ],
  ];

  const head = [arrayToTableRow(headers), alignTable(alignment)].join("\n");
  const body = rows.map(arrayToTableRow).join("\n");
  return [head, body].join("\n");
}

function reportCaniuseCoverage(stats: Result): string {
  const headers = ["", "Before", "After", "Net"];
  const alignment = ["left", "right", "right", "right"];
  const rows: [string, number, number, number][] = [
    [
      "caniuse IDs",
      stats.caniuseIdsCount - stats.change.unmappedCaniuseIdsCount,
      stats.caniuseIdsCount,
      stats.change.unmappedCaniuseIdsCount,
    ],
    [
      "caniuse IDs unmapped",
      stats.unmappedCaniuseIdsCount - stats.change.unmappedCaniuseIdsCount,
      stats.unmappedCaniuseIdsCount,
      stats.change.unmappedCaniuseIdsCount,
    ],
  ];

  const head = [arrayToTableRow(headers), alignTable(alignment)].join("\n");
  const body = rows.map(arrayToTableRow).join("\n");
  return [head, body].join("\n");
}

function formatDate(date: Temporal.ZonedDateTime): string {
  return date.toPlainDate().toString();
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
