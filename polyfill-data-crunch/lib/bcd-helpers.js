
import createDebug from 'debug';

import { ensureArray } from './utils.js';

const debug = createDebug('stable-features:feature-match:polyfill');

/**
 * @typedef VersionRangeWithNotes
 * @property {string} versionRange
 * @property {string[]|undefined} notes
 */

/**
 * @typedef CondensedBcdVersionData
 * @property {string} [versionAdded]
 * @property {boolean} [availableInPreview]
 * @property {VersionRangeWithNotes[]} [withNoteSince]
 * @property {Record<string,VersionRangeWithNotes>} [alternativeNameSince]
 * @property {VersionRangeWithNotes} [partialSince]
 * @property {Record<string,VersionRangeWithNotes>} [prefixSince]
 */

/**
 * @param {import('@mdn/browser-compat-data/types').SimpleSupportStatement[]} versionData
 * @returns {CondensedBcdVersionData|undefined}
 */
export const condenseBcdVersionData = (versionData) => {
  /** @type {CondensedBcdVersionData|undefined} */
  let result;

  for (const item of versionData) {
    const {
      alternative_name: alternativeName,
      flags,
      notes: rawNotes,
      partial_implementation: partialImplementation,
      prefix,
      version_added: versionAdded,
      version_removed: versionRemoved,
      ...otherData
    } = item;

    const notes = rawNotes === undefined ? undefined : ensureArray(rawNotes);

    if (versionAdded === undefined || versionAdded === null) {
      throw new Error('Expected a version_added');
    }
    if (Object.keys(otherData).length) {
      debug('Got unhandled version data keys: %j', Object.keys(otherData));
    }
    if (versionAdded === true) {
      throw new Error('Unexpected true value');
    }
    if (versionAdded === false) {
      if (result) throw new Error('Unexpected version_added: false');
      if (notes) throw new Error('Unexpected notes');
      return {};
    } else if (versionAdded === 'preview' || flags) {
      if (notes) throw new Error('Unexpected notes');
      return { ...result, availableInPreview: true };
    } else if (alternativeName) {
      if (partialImplementation || prefix) throw new Error('Unexpected properties in combination with alternativeName');
      result = {
        ...result,
        alternativeNameSince: {
          ...result?.alternativeNameSince,
          [alternativeName]: {
            notes: notes && !Array.isArray(notes) ? [notes] : notes,
            versionRange: versionRemoved ? `${versionAdded}-${versionRemoved}` : `>=${versionAdded}`
          }
        },
      };
    } else if (partialImplementation) {
      if (prefix) throw new Error('Unexpected property prefix on a partial implementation');
      if (result?.partialSince) throw new Error('Unexpected double partialSince');

      result = {
        ...result,
        partialSince: {
          notes: notes && !Array.isArray(notes) ? [notes] : notes,
          versionRange: versionRemoved ? `${versionAdded}-${versionRemoved}` : `>=${versionAdded}`
        },
      };
    } else if (prefix) {
      if (result?.prefixSince && result?.prefixSince[prefix]) throw new Error('Unexpected double prefixSince');

      result = {
        ...result,
        prefixSince: {
          ...result?.prefixSince,
          [prefix]: {
            notes,
            versionRange: versionRemoved ? `${versionAdded}-${versionRemoved}` : `>=${versionAdded}`
          }
        },
      };
    } else if (notes) {
      result = {
        ...result,
        withNoteSince: [
          ...(result?.withNoteSince || []),
          {
            notes,
            versionRange: versionRemoved ? `${versionAdded}-${versionRemoved}` : `>=${versionAdded}`
          }
        ]
      };
    } else {
      result = { ...result, versionAdded };
    }
  }

  return result;
};

/**
 * @param {string|string[]} name
 * @param {import('@mdn/browser-compat-data/types').Identifier} [src]
 * @returns {import('@mdn/browser-compat-data/types').SupportBlock|undefined}
 */
export const findBcdData = (name, src) => {
  if (!src) return;

  const resolvedName = Array.isArray(name)
    ? name
    : name.split('.').filter(part => part !== 'prototype');

  const current = resolvedName.shift();

  if (current) {
    // current === 'elements' && console.log('🥹', current, src[current]);
    return src[current] ? findBcdData(resolvedName, src[current]) : undefined;
  }

  return src.__compat?.support;
};
