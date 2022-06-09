import { matchAgainstBCD } from './feature-match-bcd.js';
import { matchAgainstPolyfills } from './feature-match-polyfill.js';
import { describePolyfills, listAllPolyfills, resolveAliases } from './typed-polyfill-library.js';

/**
 * @param {string[]} browsers
 * @param {string[]} features
 * @param {object} [options]
 * @param {boolean} [options.includeAllPolyfillableFeatures]
 * @returns {Promise<*>}
 */
export const matchFeatures = async (browsers, features, options = {}) => {
  const {
    includeAllPolyfillableFeatures,
  } = options;

  const resolvedFeatures = await resolveAliases([
    ...features,
    ...(
      includeAllPolyfillableFeatures
        // eslint-disable-next-line unicorn/no-await-expression-member
        ? (await listAllPolyfills()).filter(item => {
            if (item.startsWith('_')) return false;
            if (item.includes('~')) return false;
            return true;
          })
        : []
    )
  ]);

  const featureMeta = await describePolyfills(resolvedFeatures);

  const {
    // browserNeeds,
    // polyfillNeeded,
    // polyfillUnknown,
    polyfilledVersions,
  } = matchAgainstPolyfills(browsers, featureMeta);

  const {
    featuresWithErrors,
    // browserNeeds: browserNeedsBCD,
    // polyfillNeeded: polyfillNeededBCD,
    polyfilledVersions: polyfilledVersionsBCD,
  } = matchAgainstBCD(browsers, featureMeta);

  console.error('featuresWithErrors:', featuresWithErrors);
  console.log({
    // polyfillNeeded,
    // polyfillUnknown,
    // browserNeeds,
    polyfilledVersions,
    polyfilledVersionsBCD
  });
};
