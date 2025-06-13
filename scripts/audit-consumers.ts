import zlib from "node:zlib";
import stream from "node:stream/promises";

import * as cheerio from "cheerio";
import { Octokit } from "@octokit/rest";

import { features as webFeatures } from "../index.js";

// Yield all entries from chromestatus.com. Because the newest entry is returned
// first and entries might be created while we're iterating, it's possible that
// the same entry is yielded multiple times. If this is a problem they have to be
// deduplicated by ID.
async function* chromeStatusFeatures() {
  const num = 500;
  for (let start = 0 /* nothing here */; ; start += num) {
    const url = `https://chromestatus.com/api/v0/features?start=${start}&num=${num}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Bad API response: ${resp.statusText}`);
    }
    const text = await resp.text();
    if (!text.startsWith(")]}'\n")) {
      throw new Error(
        "Expected API response did not begin with the magic sequence.",
      );
    }
    const data = JSON.parse(text.substring(5));
    // Iteration is done when the API returns no features. This does mean that
    // we make one more request than necessary, but it's simple and works.
    if (!data.features.length) {
      break;
    }
    for (const f of data.features) {
      yield f;
    }
  }
}

async function chromiumSourceFile(path) {
  const url = `https://github.com/chromium/chromium/raw/refs/heads/main/${path}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Bad response: ${resp.statusText}`);
  }
  return await resp.text();
}

async function chromiumUseCounters() {
  const text = await chromiumSourceFile(
    "tools/metrics/histograms/metadata/blink/enums.xml",
  );
  const $ = cheerio.load(text);
  const $elems = $('enum[name="WebDXFeatureObserver"]').find("[value][label]");
  const counters = new Map();
  for (const e of $elems) {
    const value = parseInt($(e).attr("value"));
    const label = $(e).attr("label");
    counters.set(label, value);
  }
  return counters;
}

async function useCounterReport() {
  const counters = await chromiumUseCounters();

  // Convert feature-name to FeatureName following the same rules as
  // Chromium use counters:
  // https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/public/mojom/use_counter/metrics/webdx_feature.mojom;l=35-47;drc=af140c76c416302ecadb5e7cf3f989d6293ba5ec
  // In short, uppercase the first letter in each sequence of letters and remove hyphens.
  const expectedCounterLabels = new Set(
    Object.keys(webFeatures).map((id) => {
      return id
        .replace(/[a-z]+/g, (m) => m[0].toUpperCase() + m.substring(1))
        .replaceAll("-", "");
    }),
  );

  const items = [];

  for (let [label, value] of counters.entries()) {
    if (label == "PageVisits" && value == 0) {
      continue;
    }
    if (label.startsWith("OBSOLETE_")) {
      continue;
    }
    const draft = label.startsWith("DRAFT_");
    if (draft) {
      label = label.substring(6);
    }
    if (!expectedCounterLabels.has(label)) {
      if (draft) {
        items.push(`${label} (draft)`);
      } else {
        items.push(`${label} (not draft)`);
      }
    }
  }

  return {
    heading: "Chromium use counters",
    items,
    trailer:
      "Source: [webdx_feature.mojom](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/public/mojom/use_counter/metrics/webdx_feature.mojom)",
  };
}

async function chromeStatusReport() {
  const items = [];

  for await (const f of chromeStatusFeatures()) {
    const id = f.web_feature;
    if (!id || id === "Missing feature") {
      continue;
    }
    if (!Object.hasOwn(webFeatures, id)) {
      items.push(`${id} used by https://chromestatus.com/feature/${f.id}`);
    }
  }

  return {
    heading: "Chromestatus entries",
    items,
    trailer: "Source: [chromestatus.com](https://chromestatus.com/)",
  };
}

async function wptReport() {
  const octokit = new Octokit();

  const params = { owner: "web-platform-tests", repo: "wpt" };
  const release = await octokit.rest.repos.getLatestRelease(params);

  if (!release) {
    throw new Error(
      `No latest release of ${params.owner}/${params.repo} found`,
    );
  }

  const label = "WEB_FEATURES_MANIFEST.json.gz";
  const asset = release.data.assets.find((asset) => asset.label == label);

  if (!asset) {
    throw new Error(`No ${label} asset found in ${release.data.html_url}`);
  }

  const response = await fetch(asset.browser_download_url);
  if (!response.ok) {
    throw new Error(`Failed to download ${asset.browser_download_url}`);
  }

  const gunzip = zlib.createGunzip();
  const chunks = [];
  gunzip.on("data", (chunk) => chunks.push(chunk));
  await stream.pipeline(response.body, gunzip);
  const json = Buffer.concat(chunks).toString("utf-8");

  const manifest = JSON.parse(json);
  const ids = Object.keys(manifest.data);

  const items = [];
  for (let id of ids) {
    const draft = id.startsWith("draft/");
    if (draft) {
      id = id.substring(6);
    }
    if (!Object.hasOwn(webFeatures, id)) {
      items.push(draft ? `${id} (draft)` : id);
    }
  }

  return {
    heading: "web-platform-tests",
    items,
    trailer: `Source: [WEB_FEATURES_MANIFEST.json](${asset.browser_download_url})`,
  };
}

async function main() {
  const reports = await Promise.all([
    chromeStatusReport(),
    useCounterReport(),
    wptReport(),
  ]);

  for (const { heading, items, trailer } of reports) {
    console.log(`## ${heading}`);
    console.log();
    if (items.length) {
      for (const item of items) {
        console.log(`- [ ] ${item}`);
      }
    } else {
      console.log("Nothing to see here!");
    }
    console.log();
    console.log(trailer);
  }
}

main();
