import { Browser } from "../browser-compat-data/browser";
import { Feature } from "../browser-compat-data/feature";
import { Release } from "../browser-compat-data/release";

type Support = Map<Browser, Release | undefined>;

export function support(feature: Feature, browsers: Browser[]) {
  const support: Support = new Map();
  for (const b of browsers) {
    support.set(b, undefined);
  }

  for (const rel of feature.supportedBy({ only: browsers })) {
    const currRel = support.get(rel.browser);

    if (!currRel || currRel.compare(rel) >= 0) {
      support.set(rel.browser, rel);
    }
  }

  return support;
}
