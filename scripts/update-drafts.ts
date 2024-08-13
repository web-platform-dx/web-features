import { Compat } from "compute-baseline/browser-compat-data";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import webSpecs from "web-specs" assert { type: "json" };
import { Document } from "yaml";

import { features } from "../index.js";

type WebSpecsSpec = (typeof webSpecs)[number];

function* getPages(spec): Generator<string> {
  yield spec.url;
  if (spec.nightly?.url) {
    yield spec.nightly.url;
  }
  if (spec.nightly?.pages) {
    yield* spec.nightly.pages;
  }
}

function normalize(page: string) {
  const url = new URL(page);
  // Remove any fragment.
  url.hash = "";
  // Collapse HTML and ECMA-262 multipage into a single canonical page.
  const multipageIndex = url.pathname.indexOf("/multipage/");
  if (multipageIndex !== -1) {
    url.pathname = url.pathname.substring(0, multipageIndex + 1);
  }
  // Strip levels from CSS specs.
  if (url.hostname.startsWith("drafts.")) {
    url.pathname = url.pathname.replace(/-\d+\/$/, "/");
  }
  return String(url);
}

function formatIdentifier(s: string): string {
  return s
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .join("-");
}

async function main() {
  const compat = new Compat();

  // Build a map of used BCD keys to feature.
  const webFeatures = new Map<string, string>();
  Object.values(features).map((data) => {
    if (data.compat_features) {
      for (const compatFeature of data.compat_features) {
        webFeatures.set(compatFeature, data.name);
      }
    }
  });

  // Build a map from URLs to spec.
  const pageToSpec = new Map<string, WebSpecsSpec>();
  for (const spec of webSpecs) {
    for (const page of getPages(spec)) {
      pageToSpec.set(normalize(page), spec);
    }
  }

  // Iterate BCD and group compat features by spec.
  const specToCompatFeatures = new Map<WebSpecsSpec, Set<string>>();
  for (const feature of compat.walk()) {
    // Skip deprecated and non-standard features.
    if (feature.deprecated || !feature.standard_track) {
      continue;
    }

    // A few null values remain in BCD. They are being removed in
    // https://github.com/mdn/browser-compat-data/pull/23774.
    // TODO: Remove this workaround when BCD is free or true/null values.
    if (feature.id.startsWith("html.manifest.")) {
      continue;
    }

    const spec_url = feature.data.__compat.spec_url;
    if (!spec_url) {
      continue;
    }

    for (const url of feature.spec_url) {
      const spec = pageToSpec.get(normalize(url));
      if (!spec) {
        console.warn(`${url} not matched to any spec`);
        continue;
      }
      const keys = specToCompatFeatures.get(spec);
      if (keys) {
        keys.add(feature.id);
      } else {
        specToCompatFeatures.set(spec, new Set([feature.id]));
      }
    }
  }

  // Separate out features that are already part of web-features.
  for (const [spec, compatFeatures] of specToCompatFeatures.entries()) {
    const usedFeatures = new Map<string, Set<String>>();
    for (const key of compatFeatures) {
      if (webFeatures.has(key)) {
        const feature = webFeatures.get(key);
        if (usedFeatures.has(feature)) {
          usedFeatures.get(feature).add(key);
        } else {
          usedFeatures.set(feature, new Set([key]));
        }
        compatFeatures.delete(key);
      }
    }

    // If all features are already part of web-features, skip this spec.
    if (compatFeatures.size === 0) {
      continue;
    }

    // Write out draft feature per spec.
    const id = formatIdentifier(spec.shortname);

    const feature = new Document({
      draft_date: new Date().toISOString().substring(0, 10),
      name: spec.title,
      description: "TODO",
      spec: spec.nightly?.url ?? spec.url,
      compat_features: Array.from(compatFeatures).sort(),
    });

    if (usedFeatures.size > 0) {
      let usedFeaturesComment = ` The following features in the spec are already part of web-features:\n`;
      for (const [feature, keys] of usedFeatures.entries()) {
        usedFeaturesComment += ` - ${feature}:\n   - ${Array.from(keys).join("\n   - ")}\n`;
      }

      feature.comment = usedFeaturesComment.trimEnd();
    }
    await fs.writeFile(`features/draft/spec/${id}.yml`, feature.toString());
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
