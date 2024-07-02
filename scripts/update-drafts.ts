import { Compat } from "compute-baseline/browser-compat-data";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import webSpecs from 'web-specs' assert { type: 'json' };
import YAML from "yaml";
import { features } from '../index.js';

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
  url.hash = '';
  // Collapse HTML and ECMA-262 multipage into a single canonical page.
  const multipageIndex = url.pathname.indexOf('/multipage/');
  if (multipageIndex !== -1) {
    url.pathname = url.pathname.substring(0, multipageIndex + 1);
  }
  // Strip levels from CSS specs.
  if (url.hostname.startsWith('drafts.')) {
    url.pathname = url.pathname.replace(/-\d+\/$/, '/');
  }
  return String(url);
}

async function main() {
  const compat = new Compat();

  // Build a set of used BCD keys.
  const usedFeatures = new Set<string>(
    Object.values(features).flatMap((data) => data.compat_features)
  );

  // Build a map from URLs to spec.
  const pageToSpec = new Map<string, object>();
  for (const spec of webSpecs) {
    for (const page of getPages(spec)) {
      pageToSpec.set(normalize(page), spec);
    }
  }

  // Iterate BCD and group compat features by spec.
  const specToCompatFeatures = new Map<object, Set<string>>();
  for (const feature of compat.walk()) {
    // Skip any BCD keys already used in web-features.
    if (usedFeatures.has(feature.id)) {
      continue;
    }

    // Skip deprecated and non-standard features.
    if (feature.deprecated || !feature.standard_track) {
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

  for (const [spec, compatFeatures] of specToCompatFeatures.entries()) {
    // Write out draft feature per spec.
    const id = spec.shortname;

    const feature = {
      draft_date: new Date().toISOString().substring(0, 10),
      name: spec.title,
      description: 'TODO',
      spec: spec.nightly?.url ?? spec.url,
      compat_features: Array.from(compatFeatures).sort(),
    };
    const yaml = YAML.stringify(feature);
    await fs.writeFile(`features/draft/spec/${id}.yml`, yaml);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
