import bcd from '@mdn/browser-compat-data';
import { semverIntersect } from '@voxpelli/semver-set';
import createDebug from 'debug';

import { condenseBcdVersionData, findBcdData } from './bcd-helpers.js';
import { mapBrowserslistToBCD } from './browser-mapping.js';
import { polyfillToBcdFeatureMapping } from './feature-mapping.js';
import { ensureArray, typedObjectKeys } from './utils.js';

const debug = createDebug('stable-features:feature-match:bcd');

/**
 * @typedef BCDMatches
 * @property {Set<string>} polyfillNeeded
 * @property {Set<string>} featuresWithErrors
 * @property {Partial<Record<keyof ReturnType<typeof mapBrowserslistToBCD>, Record<string, string|boolean>>>} browserNeeds
 * @property {Partial<Record<keyof ReturnType<typeof mapBrowserslistToBCD>, Set<string|false>>>} polyfilledVersions
 */

/**
 * @param {string[]} browsers
 * @param {import('./typed-polyfill-library').PolyfillMetaItem[]} features
 * @returns {BCDMatches}
 */
export const matchAgainstBCD = (browsers, features) => {
  const bcdBrowsers = mapBrowserslistToBCD(browsers);

  /** @type {Set<string>} */
  const featuresWithErrors = new Set();

  /** @type {Set<string>} */
  const polyfillNeeded = new Set();

  /**
   * Keyed by browser then feature, with a "false" on the feature meaning that there was no entry for the browser, a "true" meaning no polyfill was needed and a range indicating where a polyfill is needed
   *
   * @type {Partial<Record<keyof typeof bcdBrowsers, Record<string, string|boolean>>>}
   */
  const browserNeeds = {};

  /**
   * Which versions of the browsers will have a polyfill loaded?
   *
   * @type {Partial<Record<keyof typeof bcdBrowsers, Set<string>>>}
   */
  const polyfilledVersions = {};

  for (const rawFeatureData of features) {
    const rawFeature = polyfillToBcdFeatureMapping[rawFeatureData.name] === undefined
      ? rawFeatureData.name
      : polyfillToBcdFeatureMapping[rawFeatureData.name];

    if (!rawFeature) {
      debug('Ignoring polyfill data with no match in BCD: %s', rawFeatureData.name);
      continue;
    }

    /** @type {import('@mdn/browser-compat-data/types').SupportBlock|undefined} */
    const bcdSupportData = findBcdData(rawFeature, bcd.api) ||
      findBcdData(rawFeature, bcd.javascript['builtins']) ||
      findBcdData(rawFeature, bcd);

    if (!bcdSupportData) {
      debug('Could not find BCD data for feature: %s', rawFeature);
      featuresWithErrors.add(rawFeature);
      continue;
    }

    for (const browser of typedObjectKeys(bcdBrowsers)) {
      const bcdData = bcdSupportData[browser];

      /** @type {import('./bcd-helpers').CondensedBcdVersionData|undefined} */
      let data;

      try {
        data = bcdData && condenseBcdVersionData(ensureArray(bcdData));
      } catch (err) {
        debug('Failed to condense BCD version data for "%s" in "%s": %O', rawFeature, browser, err);
      }

      if (!data) {
        debug('Missing BCD data for "%s" in "%s"', rawFeature, browser);
        featuresWithErrors.add(rawFeature);
        continue;
      }

      const {
        // alternativeNameSince,
        // availableInPreview,
        // partialSince,
        // prefixSince,
        versionAdded,
        // withNoteSince,
      } = data;

      /** @type {true|string|undefined} */
      let unsupportedInBrowsersubset;

      if (versionAdded === undefined) {
        unsupportedInBrowsersubset = '*';
      } else {
        const supportedRange = Number.isInteger(versionAdded[0]) ? '>=' + versionAdded : versionAdded.replace('≤', '<=');
        const browserTarget = bcdBrowsers[browser]?.join(' || ');
        try {
          unsupportedInBrowsersubset = browserTarget && semverIntersect(supportedRange, browserTarget);
        } catch (err) {
          debug('Unexpected error for semverIntersect() with "%s" in "%s" and supportedRange "%s": %O', rawFeature, browser, supportedRange, err);
          unsupportedInBrowsersubset = '*';
        }
      }

      if (unsupportedInBrowsersubset) {
        polyfillNeeded.add(rawFeature);

        const current = polyfilledVersions[browser];
        if (current) {
          current.add(unsupportedInBrowsersubset);
        } else {
          polyfilledVersions[browser] = new Set([unsupportedInBrowsersubset]);
        }

        browserNeeds[browser] = {
          ...browserNeeds[browser],
          [rawFeature]: unsupportedInBrowsersubset,
        };

        // if (availableInPreview) {
        //   console.log(`🧪 "${rawFeature}" available in preview for ${browser}`);
        // }
        // if (withNoteSince) {
        //   for (const value of withNoteSince) {
        //     console.log(`📝 "${rawFeature}" available with note in ${browser} since ${value.versionRange}: ${value.notes?.join(', ') || '-'}`);
        //   }
        // }
        // if (alternativeNameSince) {
        //   for (const value in alternativeNameSince) {
        //     console.log(`🛠 "${rawFeature}" available under alternative name ${value} in ${browser} since ${alternativeNameSince[value]?.versionRange}: ${alternativeNameSince[value]?.notes?.join(', ') || '-'}`);
        //   }
        // }
        // if (partialSince) {
        //   console.log(`💥 "${rawFeature}" partially available in ${browser} since ${partialSince.versionRange}: ${partialSince.notes?.join(', ') || '-'}`);
        // }
        // if (prefixSince) {
        //   for (const value in prefixSince) {
        //     console.log(`🔨 "${rawFeature}" available under prefix ${value} in ${browser} since ${prefixSince[value]?.versionRange}: ${prefixSince[value]?.notes?.join(', ') || '-'}`);
        //   }
        // }
      }
    }
  }

  // FIXME: Make this and the polyfill one return the same data with same browser keys
  return {
    browserNeeds,
    polyfillNeeded,
    polyfilledVersions,
    featuresWithErrors
  };
};
