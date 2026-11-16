import { Temporal } from "@js-temporal/polyfill";
import { Octokit } from "@octokit/rest";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import type { Result } from "./stats.ts";

const tz = "Etc/UTC";
const owner = "web-platform-dx";
const repo = "web-features";

const argv = yargs(process.argv.slice(2))
  .usage("$0", "Print Mermaid graphs based on release stats.")
  .option("include-next", {
    description:
      "Include the `next`-tagged prerelease data, if it's within the date range.",
    type: "boolean",
  })
  .option("start-date", {
    description:
      "The beginning of the range of time to print a graph for. Takes a timestamp like `2026-09-21T00:04:00+00:00` that is assumed to be UTC.",
    type: "string",
    nargs: 1,
  })
  .option("end-date", {
    description:
      "The beginning of the range of time to print a graph for. Takes a timestamp like `2026-09-21T00:04:00+00:00` that is assumed to be UTC.",
    type: "string",
    nargs: 1,
  })
  .option("gh-token", {
    describe: "GitHub authentication token (e.g., from `gh auth token`)",
    type: "string",
    nargs: 1,
  })
  .parseSync();

async function main() {
  const today = Temporal.Now.zonedDateTimeISO("Etc/UTC").with({
    hour: 0,
    minute: 0,
    second: 0,
  });
  const defaultEndDate = today;
  const defaultStartDate = defaultEndDate.subtract({ weeks: 6 });
  const endDate = timeStampToZonedDateTimeUTC(argv.endDate ?? defaultEndDate);
  const startDate = timeStampToZonedDateTimeUTC(
    argv.startDate ?? defaultStartDate,
  );

  const gh = new GitHub(argv.ghToken);

  const [points, bins] = await Promise.all([
    getReleaseChartPoints(gh, startDate, endDate),
    binKeysByDaysShipping(),
  ]);

  console.log(mermaid`
xychart
  title "Unmapped BCD keys (fewer is better)"
  x-axis "web-features releases" ${JSON.stringify(points.map((p) => formatReleaseName(p.release)))}
  y-axis 0 --> 3500
  line "All" ${JSON.stringify(points.map((p) => p.stats.unmappedCompatKeysCount))}
  line "Normal" ${JSON.stringify(points.map((p) => p.stats.unmappedNormalCompatKeysCount))}
  line "Deprecated or non-standard" ${JSON.stringify(points.map((p) => p.stats.unmappedDiscourageableCompatKeysCount))}
`);

  console.log(mermaid`
---
config:
  xyChart:
    showDataLabel: true
    showDataLabelOutsideBar: true
---
xychart
  title "Unmapped BCD keys by cumulative shipping age"
  x-axis "Age" ${JSON.stringify(bins.map((b) => b.name))}
  y-axis "Keys" 0 --> ${Math.max(...bins.map((b) => b.keys.length)) * 1.1}
  bar ${JSON.stringify(bins.map((b) => b.keys.length))}
`);

  console.log(mermaid`
xychart
  title "Cumulative shipping days of unmapped keys (fewer is better)"
  x-axis "web-features releases" ${JSON.stringify(points.map((p) => formatReleaseName(p.release)))}
  y-axis 0 --> 40000000
  line "All" ${JSON.stringify(points.map((p) => p.stats.unmappedCompatKeysCumulativeShippingDays))}
  line "Normal" ${JSON.stringify(points.map((p) => p.stats.unmappedNormalCompatKeysCumulativeShippingDays))}
  line "Deprecated or non-standard" ${JSON.stringify(points.map((p) => p.stats.unmappedDiscourageableCompatKeysCumulativeShippingDays))}
`);

  console.log(mermaid`
xychart
  title "Unmapped caniuse features (fewer is better)"
  x-axis "web-features releases" ${JSON.stringify(points.map((p) => formatReleaseName(p.release)))}
  y-axis 0 --> 250
  line "All" ${JSON.stringify(points.map((p) => p.stats.unmappedCaniuseIdsCount))}
`);
}

class GitHub {
  octokit: Octokit;

  constructor(auth?: string) {
    this.octokit = new Octokit({
      tz,
      auth,
    });
  }

  getReleases() {
    return this.octokit.paginate(this.octokit.rest.repos.listReleases, {
      owner,
      repo,
    });
  }

  async getReleaseAsset(release_id: number, name: string) {
    const assets = await this.octokit.rest.repos.listReleaseAssets({
      owner,
      repo,
      release_id,
    });
    const { id: asset_id } = assets.data.find((value) => value.name === name);
    const asset = await this.octokit.rest.repos.getReleaseAsset({
      owner,
      repo,
      asset_id,
      headers: {
        accept: "application/octet-stream",
      },
    });
    const data = asset.data as unknown as ArrayBuffer;
    return JSON.parse(new TextDecoder().decode(data));
  }
}

async function getReleaseChartPoints(
  gh: GitHub,
  startDate: Temporal.ZonedDateTime,
  endDate: Temporal.ZonedDateTime,
): Promise<
  {
    release: string;
    stats: Result;
  }[]
> {
  const releases = await gh.getReleases();
  const releasesInRange = releases
    .filter((release) => {
      const releaseDate = timeStampToZonedDateTimeUTC(release.published_at);
      if (inRange(releaseDate, startDate, endDate)) {
        if (release.tag_name === "next") {
          return argv.includeNext;
        }
        return true;
      }
      return false;
    })
    .toSorted((a, b) => a.published_at.localeCompare(b.published_at));

  return Promise.all(
    releasesInRange.map(async (r) => {
      return {
        release: r.name,
        stats: (await gh.getReleaseAsset(r.id, "stats.json")) as Result,
      };
    }),
  );
}

async function binKeysByDaysShipping() {
  const bins: {
    name: string;
    from: number;
    to: number;
    keys: string[];
  }[] = [
    {
      name: "0 days",
      from: 0,
      to: 0,
      keys: [],
    },
    {
      name: "1 to 21 days",
      from: 1,
      to: 3 * 7,
      keys: [],
    },
    {
      name: "22 days to 1 year",
      from: 3 * 7 + 1,
      to: 365,
      keys: [],
    },
    {
      name: "1–10 years",
      from: 365 + 1,
      to: 365 * 10,
      keys: [],
    },
    {
      name: ">10 years",
      from: 365 * 10 + 1,
      to: Infinity,
      keys: [],
    },
  ];

  const { compatFeaturesToCumulativeDaysShipped } =
    await import("./unmapped-compat-keys.ts");
  const featuresToDays = compatFeaturesToCumulativeDaysShipped();

  for (const [feat, days] of featuresToDays.entries()) {
    let assigned = false;
    for (const bin of bins) {
      if (bin.from <= days && days <= bin.to) {
        bin.keys.push(feat.id);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      throw new Error(`${feat.id} not assigned to a bin @ ${days}`);
    }
  }

  return bins;
}

/** Tagged template function produces a Mermaid chart string without having
 * escape a bunch of backticks. */
function mermaid(strings: TemplateStringsArray, ...exprs): string {
  const joined = strings
    .map((str, index) => str + (exprs[index] || ""))
    .join("")
    .trim();
  return ["```mermaid", joined, "```"].join("\n");
}

function timeStampToZonedDateTimeUTC(
  timestamp: string | Temporal.ZonedDateTime,
): Temporal.ZonedDateTime {
  if (timestamp instanceof Temporal.ZonedDateTime) {
    return timestamp.withTimeZone(tz);
  }
  return Temporal.Instant.from(timestamp).toZonedDateTimeISO(tz);
}

function inRange(
  dt: Temporal.ZonedDateTime,
  start: Temporal.ZonedDateTime,
  end: Temporal.ZonedDateTime,
) {
  return (
    Temporal.ZonedDateTime.compare(dt, start) >= 0 &&
    Temporal.ZonedDateTime.compare(dt, end) < 0
  );
}

function formatReleaseName(name: string) {
  return name.replace("web-features@", "");
}

if (import.meta.url.startsWith("file:")) {
  if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
  }
}
