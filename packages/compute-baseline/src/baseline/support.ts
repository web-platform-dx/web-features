import { Browser } from "../browser-compat-data/browser.js";
import { Feature } from "../browser-compat-data/feature.js";
import { Release } from "../browser-compat-data/release.js";
import { Qualifications } from "../browser-compat-data/supportStatements.js";
import { logger } from "./index.js";

type Support = Map<Browser, Release | undefined>;

/**
 * Map browsers to the release that most-recently introduced support for the feature.
 */
export function support(feature: Feature, browsers: Browser[]): Support {
  const support: Support = new Map();
  for (const b of browsers) {
    const releases = feature.supportedBy({ only: [b] });
    // TODO:
    // let lastInitial: Release | undefined;
    // let lastInitialBoundary: "" | "≤" | undefined;

    // const reverseChronological = b.releases.slice().reverse();
    // let previousRelease: string | undefined;
    // for (let index = b.releases.length - 1; index >= 0; index--) {
    //   const release = reverseChronological[index] as Release;
    //   const current = feature.flatSupportedIn(release);

    //   // Check if current has changed, etc.
    // }

    const unqualifiedReleases = [];
    const qualifiedReleases = [];
    for (const { release, qualifications } of releases) {
      if (qualifications) {
        qualifiedReleases.push({ release, qualifications });
      } else {
        unqualifiedReleases.push(release);
      }
    }

    const currentlySupported = unqualifiedReleases.includes(b.current());
    if (currentlySupported) {
      support.set(b, lastInitialRelease(unqualifiedReleases));
    } else {
      support.set(b, undefined);
    }

    logReleaseOmissions(feature, qualifiedReleases, unqualifiedReleases);
  }

  return support;
}

/**
 * Find the most-recent first release of a consecutive series of releases.
 *
 * For example, given browser versions [50, 51, 52, 99, 100, 101], return release 99, since that was the most-recent release to start a consecutive series.
 */
export function lastInitialRelease(releases: Release[]): Release | undefined {
  let newestFirst = releases.sort((a, b) => b.compare(a));

  let initial: Release | undefined = undefined;
  for (const thisRelease of newestFirst) {
    if (!initial || initial.releaseIndex - 1 === thisRelease.releaseIndex) {
      initial = thisRelease;
    } else {
      break;
    }
  }
  return initial;
}

function logReleaseOmissions(
  feature: Feature,
  qualified: { release: Release; qualifications: Qualifications }[],
  unqualified: Release[],
) {
  if (!logger || !logger.debug) {
    return;
  }

  const unqual = new Set(unqualified);
  const aggregated = new Map<
    Browser,
    { release: Release; qualifications: Qualifications }[]
  >();

  for (const { release, qualifications } of qualified) {
    // Only aggregate browsers with no corresponding unqualified release (e.g., shipping both prefixed and unprefixed shouldn't make noise)
    if (!unqual.has(release)) {
      const agg = aggregated.get(release.browser) || [];
      agg.push({ release, qualifications });
      aggregated.set(release.browser, agg);
    }
  }

  for (const [browser, releases] of aggregated.entries()) {
    const qualifications: string[] = Array.from(
      new Set(
        releases.flatMap(({ release, qualifications }) =>
          Object.keys(qualifications),
        ),
      ),
    );
    logger.debug(
      `${feature}: ${browser} has ${releases.length} releases deemed unsupported due to ${qualifications.join(", ")}. See underlying data for details.`,
    );
  }
}
