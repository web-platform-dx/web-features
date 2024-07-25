import { Temporal } from "@js-temporal/polyfill";
import assert from "assert";
import { Browser } from "../browser-compat-data/browser.js";
import { Feature } from "../browser-compat-data/feature.js";
import { Release } from "../browser-compat-data/release.js";

export interface InitialSupport {
  release: Release;
  ranged: boolean;
  text: string;
}

export type SupportMap = Map<Browser, InitialSupport | undefined>;

/**
 * Map browsers to the release that most-recently introduced support for the feature.
 */
export function support(feature: Feature, browsers: Browser[]): SupportMap {
  const support: SupportMap = new Map();
  for (const b of browsers) {
    let lastInitial: Release | undefined;
    let lastInitialBoundary: "" | "≤" = "";
    for (let index = b.current().releaseIndex; index >= 0; index--) {
      const release = b.releases[index];
      assert(release instanceof Release, `No index ${index} in ${b} releases`); // This shouldn't happen, but neither should off-by-one errors. 🫠
      const supported = feature.supportedIn(release);

      if (!lastInitial) {
        if ([false, null].includes(supported)) {
          // First-iteration only: bail when the latest release does not support
          // the feature.
          break;
        }
        lastInitial = release;
        continue;
      }

      if (supported === null) {
        lastInitialBoundary = "≤";
        break;
      }
      if (supported === false) {
        lastInitialBoundary = "";
        break;
      }
      lastInitial = release;
    }

    if (!lastInitial) {
      support.set(b, undefined);
    } else {
      support.set(b, {
        release: lastInitial,
        ranged: lastInitialBoundary === "≤",
        text: `${lastInitialBoundary}${lastInitial.version}`,
      });
    }
  }

  return support;
}

/**
 * Returns a number indicating whether an `InitialSupport` object comes before
 * (negative), after (positive), in the same position (0) by sort order.
 */
export function compareInitialSupport(
  i1: InitialSupport,
  i2: InitialSupport,
): number {
  // If they're the same browser, compare them by release order and rangeyness
  if (i1.release.browser === i2.release.browser) {
    if (i1.release.compare(i2.release) === 0) {
      if (i1.ranged && !i2.ranged) {
        return -1;
      }
      if (!i1.ranged && i2.ranged) {
        return 1;
      }
      return 0;
    }
    return i1.release.compare(i2.release);
  }

  // If they're different browsers, check if they have a release date. If not,
  // no release date comes after releases with dates.
  if (i1.release.date === null) {
    if (i2.release.date !== null) {
      return 1;
    }
    if (i2.release.date === null) {
      return 0;
    }
    return -1;
  }

  if (i2.release.date === null) {
    if (i1.release.date !== null) {
      return 1;
    }
    if (i1.release.date === null) {
      return 0;
    }
    return -1;
  }

  if (Temporal.PlainDate.compare(i1.release.date, i2.release.date) === 0) {
    if (i1.ranged && !i2.ranged) {
      return -1;
    }
    if (!i1.ranged && i2.ranged) {
      return 1;
    }
    return 0;
  }
  return Temporal.PlainDate.compare(i1.release.date, i2.release.date);
}
