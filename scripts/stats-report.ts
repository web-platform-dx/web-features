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
  return [
    "### BCD coverage",
    "",
    "This shows feature entry coverage for fine-grained compatibility data. For unmapped keys, fewer is better.",
    "",
    reportCompatCoverage(stats),
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
  ].join("\n");
}

function reportCompatCoverage(stats: Result): string {
  const headers = ["", "Before", "After", "Net"];
  const alignment = ["left", "right", "right", "right"];
  const rows: [string, number, number, number][] = [
    [
      "BCD keys",
      stats.compatKeysCount - stats.change.compatKeysCountChange,
      stats.compatKeysCount,
      stats.change.compatKeysCountChange,
    ],
    [
      "All keys unmapped",
      stats.unmappedCompatKeysCount -
        stats.change.unmappedCompatKeysCountChange,
      stats.unmappedCompatKeysCount,
      stats.change.unmappedCompatKeysCountChange,
    ],
    [
      "Normal keys unmapped",
      stats.unmappedNormalCompatKeysCount -
        stats.change.unmappedNormalCompatKeysCountChange,
      stats.unmappedNormalCompatKeysCount,
      stats.change.unmappedNormalCompatKeysCountChange,
    ],
    [
      "Deprecated or non-standard keys unmapped",
      stats.unmappedDiscourageableCompatKeysCount -
        stats.change.unmappedDiscourageableCompatKeysCountChange,
      stats.unmappedDiscourageableCompatKeysCount,
      stats.change.unmappedDiscourageableCompatKeysCountChange,
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
        stats.change.unmappedCompatKeysCumulativeShippingDaysChange,
      stats.unmappedCompatKeysCumulativeShippingDays,
      stats.change.unmappedCompatKeysCumulativeShippingDaysChange,
    ],
    [
      "Normal keys unmapped",
      stats.unmappedNormalCompatKeysCumulativeShippingDays -
        stats.change.unmappedNormalCompatKeysCumulativeShippingDaysChange,
      stats.unmappedNormalCompatKeysCumulativeShippingDays,
      stats.change.unmappedNormalCompatKeysCumulativeShippingDaysChange,
    ],
    [
      "Deprecated or non-standard keys unmapped",
      stats.unmappedDiscourageableCompatKeysCumulativeShippingDays -
        stats.change
          .unmappedDiscourageableCompatKeysCumulativeShippingDaysChange,
      stats.unmappedDiscourageableCompatKeysCumulativeShippingDays,
      stats.change.unmappedDiscourageableCompatKeysCumulativeShippingDaysChange,
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
      stats.caniuseIdsCount - stats.change.unmappedCaniuseIdsCountChange,
      stats.caniuseIdsCount,
      stats.change.unmappedCaniuseIdsCountChange,
    ],
    [
      "caniuse IDs unmapped",
      stats.unmappedCaniuseIdsCount -
        stats.change.unmappedCaniuseIdsCountChange,
      stats.unmappedCaniuseIdsCount,
      stats.change.unmappedCaniuseIdsCountChange,
    ],
  ];

  const head = [arrayToTableRow(headers), alignTable(alignment)].join("\n");
  const body = rows.map(arrayToTableRow).join("\n");
  return [head, body].join("\n");
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
