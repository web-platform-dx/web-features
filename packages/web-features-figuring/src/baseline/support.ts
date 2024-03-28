import { release } from "os";
import { Browser } from "../browser-compat-data/browser";
import { Compat } from "../browser-compat-data/compat";
import { Feature } from "../browser-compat-data/feature";
import { Release } from "../browser-compat-data/release";
import { Qualifications } from "../browser-compat-data/supportStatements";

type Support = Map<Browser, Release | undefined>;

/**
 * Map browsers to the release that most-recently introduced support for the feature.
 */
export function support(feature: Feature, browsers: Browser[]): Support {
  const support: Support = new Map();
  for (const b of browsers) {
    const releases = feature.supportedBy({ only: [b] });

    const unqualifiedReleases = [];
    const qualifiedReleases = [];
    for (const { release, qualifications } of releases) {
      if (qualifications === undefined) {
        unqualifiedReleases.push(release);
      } else {
        qualifiedReleases.push({ release, qualifications });
      }
    }

    logReleaseOmissions(feature, qualifiedReleases, unqualifiedReleases);

    support.set(b, lastInitialRelease(unqualifiedReleases));
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
    console.warn(
      `${feature}: ${browser} has ${releases.length} releases deemed unsupported due to ${qualifications.join(", ")}. See underlying data for details.`,
    );
  }
}
