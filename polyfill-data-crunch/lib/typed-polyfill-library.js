import {
  describePolyfill as untypedDescribePolyfill,
  listAliases as untypedListAliases,
  listAllPolyfills as untypedListAllPolyfills,
  // @ts-ignore
} from 'polyfill-library';

import createDebug from 'debug';

const debug = createDebug('stable-features:polyfill-library');

/**
 * @typedef PolyfillMeta
 * @property {string[]} [dependencies]
 * @property {string} [license]
 * @property {string} [spec]
 * @property {string} [repo]
 * @property {string[]} [notes]
 * @property {string} [docs]
 * @property {Record<string,string>} [browsers]
 * @property {Record<string,string>} [install]
 * @property {string} [detectSource]
 * @property {string} [baseDir]
 * @property {boolean} [hasTests]
 * @property {boolean} [isTestable]
 * @property {boolean} [isPublic]
 * @property {number} [size]
 */

/**
 * Get the metadata for a specific polyfill within the collection of polyfill sources.
 *
 * @param {string} featureName - The name of a polyfill whose metadata should be returned.
 * @returns {Promise<PolyfillMeta|undefined>} A promise which resolves with the metadata or with `undefined` if no metadata exists for the polyfill.
 */
export const describePolyfill = async (featureName) => {
  return untypedDescribePolyfill(featureName);
};

/** @typedef {{ name: string, missingPolyfillDescription: true }} PolyfillWithoutDescription */
/** @typedef {PolyfillMeta & { name: string, missingPolyfillDescription: false }} PolyfillWithDescription */
/** @typedef {PolyfillWithoutDescription | PolyfillWithDescription} PolyfillMetaItem */

/**
 * @param {string[]} featureNames
 * @returns {Promise<PolyfillMetaItem[]>}
 */
export const describePolyfills = async (featureNames) => {
  return Promise.all(
    featureNames
      .map(async item => {
        const result = await describePolyfill(item);
        if (!result) {
          debug('Missing polyfill description for: %s', item);
          return { name: item, missingPolyfillDescription: true };
        }
        return {
          ...result,
          missingPolyfillDescription: false,
          name: item,
        };
      })
  );
};

/**
 * Get a list of all the aliases which exist within the collection of polyfill sources.
 *
 * @returns {Promise<{ [polyfillTarget: string]: string[] }>} A promise which resolves with an object mapping all the aliases within the collection to the polyfills they include.
 */
export const listAliases = async () => {
  return untypedListAliases();
};

/**
 * Get a list of all the polyfills which exist within the collection of polyfill sources.
 *
 * @returns {Promise<string[]>} A promise which resolves with an array of all the polyfills within the collection.
 */
export const listAllPolyfills = async () => {
  return untypedListAllPolyfills();
};

/**
 * @param {string[]} features
 * @returns {Promise<string[]>}
 */
export const resolveAliases = async (features) => {
  const aliases = await listAliases();

  /** @type {Set<string>} */
  const list = new Set();

  for (const target of features) {
    for (const item of (aliases[target] || [target])) {
      list.add(item);
    }
  }

  return [...list];
};
