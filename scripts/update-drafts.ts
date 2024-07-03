import { Compat } from "compute-baseline/browser-compat-data";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import YAML , {Document, YAMLSeq, Scalar} from "yaml";
import webSpecs from 'web-specs' assert { type: 'json' };
import features from '../index.js';

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
  const usedFeatures = new Map<string,string>();
  Object.values(features).map((data) => {
    //console.log(data);
    if(data.compat_features){
    for(const compatFeature of data.compat_features){
      usedFeatures.set(compatFeature, data.name);
    }
  }
  })

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
    // // Skip any BCD keys already used in web-features.
    // if (usedFeatures.has(feature.id)) {
    //   continue;
    // }

    // Skip deprecated and non-standard features.
    const status = feature.data.__compat.status;
    if (status?.deprecated || !status?.standard_track) {
      continue;
    }

    const spec_url = feature.data.__compat.spec_url;
    if (!spec_url) {
      continue;
    }

    const urls = Array.isArray(spec_url) ? spec_url : [spec_url];
    for (const url of urls) {
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

    const feature = new Document({
      draft_date: new Date().toISOString().substring(0, 10),
      name: spec.title,
      description: 'TODO',
      spec: spec.nightly?.url ?? spec.url,
      
    });

    // add compat_features with comments for the ones that are already mapped
    const list = new YAMLSeq();
    for (const key of Array.from(compatFeatures).sort()) {
      const item = new Scalar(key);
      if(usedFeatures.has(key)){
        item.comment = `Already part of ${usedFeatures.get(key)}`;
      }
    list.add(item);
    }

    feature.set("compat_features", list);

    const yaml = YAML.stringify(feature);    
    await fs.writeFile(`features/draft/spec/${id}.yml`, yaml);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}