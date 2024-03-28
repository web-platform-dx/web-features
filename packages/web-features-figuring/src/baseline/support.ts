import { Browser } from "../browser-compat-data/browser";
import { Compat } from "../browser-compat-data/compat";
import { Feature } from "../browser-compat-data/feature";
import { Release } from "../browser-compat-data/release";

type Support = Map<Browser, Release | undefined>;

/**
 * Map browsers to the release that most-recently introduced support for the feature.
 */
export function support(feature: Feature, browsers: Browser[]): Support {
  const support: Support = new Map();
  for (const b of browsers) {
    const releases = feature.supportedBy({ only: [b] });
    support.set(b, lastInitialRelease(releases));
  }

  return support;
}

/**
 * Find the most-recent first release of a consecutive series of releases.
 *
 * For example, given browser versions [50, 51, 52, 99, 100, 101], return release 99, since that was the most-recent release to start a consecutive series.
 */
export function lastInitialRelease(releases: Release[]): Release | undefined {
  let newestFirst = [...releases].sort((a, b) => b.compare(a));

  let initial: Release | undefined = undefined;
  for (const thisRelease of newestFirst) {
    if (initial === undefined) {
      initial = thisRelease;
    } else if (initial.releaseIndex - 1 === thisRelease.releaseIndex) {
      initial = thisRelease;
    } else {
      break;
    }
  }
  return initial;
}
