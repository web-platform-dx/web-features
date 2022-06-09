import { semverIntersect } from '@voxpelli/semver-set';
import createDebug from 'debug';

import { mapBrowserslistToPolyfills } from './browser-mapping.js';
import { typedObjectKeys } from './utils.js';

const debug = createDebug('stable-features:feature-match:polyfill');

/**
 * @typedef PolyfillMatches
 * @property {Set<string>} polyfillNeeded
 * @property {Set<string>} polyfillUnknown
 * @property {Partial<Record<keyof ReturnType<typeof mapBrowserslistToPolyfills>, Record<string, string|boolean>>>} browserNeeds
 * @property {Partial<Record<keyof ReturnType<typeof mapBrowserslistToPolyfills>, Set<string|false>>>} polyfilledVersions
 */

/**
 * @param {string[]} browsers
 * @param {import('./typed-polyfill-library').PolyfillMetaItem[]} features
 * @returns {PolyfillMatches}
 */
export const matchAgainstPolyfills = (browsers, features) => {
  const polyfillBrowsers = mapBrowserslistToPolyfills(browsers);

  /** @type {Set<string>} */
  const polyfillNeeded = new Set();
  /** @type {Set<string>} */
  const polyfillUnknown = new Set();

  /**
   * Keyed by browser then feature, with a "false" on the feature meaning that there was no entry for the browser, a "true" meaning no polyfill was needed and a range indicating where a polyfill is needed
   *
   * @type {Partial<Record<keyof typeof polyfillBrowsers, Record<string, string|boolean>>>}
   */
  const browserNeeds = {};

  /**
   * Which versions of the browsers will have a polyfill loaded?
   *
   * @type {Partial<Record<keyof typeof polyfillBrowsers, Set<string>>>}
   */
  const polyfilledVersions = {};

  for (const feature of features) {
    if (feature.missingPolyfillDescription) {
      polyfillUnknown.add(feature.name);
      continue;
    }
    if (!feature.browsers) {
      debug('Polyfill for feature "%s" is missing browsers definition: %O', feature.name, feature);
      polyfillUnknown.add(feature.name);
      continue;
    }

    for (const browser of typedObjectKeys(polyfillBrowsers)) {
      const browserRange = polyfillBrowsers[browser]?.join(' || ');

      // Skip browser targets with no ranges
      if (!browserRange) continue;

      const featureRange = feature?.browsers[browser];

      // If we have a feature range, then
      if (featureRange) {
        const intersection = semverIntersect(featureRange, browserRange);

        // If the feature range intersect with our browser range, then it will be polyfilled, else it won't
        if (intersection) {
          polyfillNeeded.add(feature.name);

          const current = polyfilledVersions[browser];
          if (current) {
            current.add(intersection);
          } else {
            polyfilledVersions[browser] = new Set([featureRange]);
          }

          browserNeeds[browser] = {
            ...browserNeeds[browser],
            [feature.name]: intersection,
          };
        } else {
          browserNeeds[browser] = {
            ...browserNeeds[browser],
            [feature.name]: true,
          };
        }
      } else {
        browserNeeds[browser] = {
          ...browserNeeds[browser],
          [feature.name]: false,
        };
      }
    }
  }

  return {
    browserNeeds,
    polyfillNeeded,
    polyfillUnknown,
    polyfilledVersions,
  };
};
