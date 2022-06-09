import { filterNonObjectKeys } from './utils.js';

/**
 * @typedef BrowsersListNames
 * @property {'and_chr'} and_chr
 * @property {'and_ff'} and_ff
 * @property {'and_qq'} and_qq
 * @property {'android'} android
 * @property {'chrome'} chrome
 * @property {'edge'} edge
 * @property {'firefox'} firefox
 * @property {'ie'} ie
 * @property {'ios_saf'} ios_saf
 * @property {'kaios'} kaios
 * @property {'op_mob'} op_mob
 * @property {'opera'} opera
 * @property {'safari'} safari
 * @property {'samsung'} samsung
 */

/**
 * @template {{ [key in keyof BrowsersListNames]?: any }} T
 * @typedef {{ [K in keyof BrowsersListNames]: T[K] extends string|false ? T[K] : BrowsersListNames[K] }} Mapping
 */

/**
 * @typedef BrowsersListToPolyfill
 * @property {'chrome'} and_chr
 * @property {'firefox_mob'} and_ff
 * @property {'samsung_mob'} samsung
 * @property {false} and_qq
 * @property {false} kaios
 */

/**
 * @typedef BrowsersListToBCD
 * @property {'chrome_android'} and_chr
 * @property {'firefox_android'} and_ff
 * @property {'opera_android'} op_mob
 * @property {'safari_ios'} ios_saf
 * @property {'samsunginternet_android'} samsung
 * @property {'webview_android'} android
 * @property {false} and_qq
 * @property {false} kaios
 */

/** @type {Readonly<BrowsersListNames>} */
const browserslistNames = {
  and_chr: 'and_chr',
  and_ff: 'and_ff',
  and_qq: 'and_qq',
  android: 'android',
  chrome: 'chrome',
  edge: 'edge',
  firefox: 'firefox',
  ie: 'ie',
  ios_saf: 'ios_saf',
  kaios: 'kaios',
  op_mob: 'op_mob',
  opera: 'opera',
  safari: 'safari',
  samsung: 'samsung',
};

/** @type {Readonly<Mapping<BrowsersListToPolyfill>>} */
const browserslistBrowserToPolyfillBrowser = {
  ...browserslistNames,
  'and_chr': 'chrome',
  'and_ff': 'firefox_mob',
  'and_qq': false,
  'kaios': false,
  'samsung': 'samsung_mob',
};

/** @type {Readonly<Mapping<BrowsersListToBCD>>} */
const browserslistBrowserToBCDBrowser = {
  ...browserslistNames,
  'and_chr': 'chrome_android',
  'and_ff': 'firefox_android',
  'and_qq': false,
  'android': 'webview_android',
  'ios_saf': 'safari_ios',
  'kaios': false,
  'op_mob': 'opera_android',
  'samsung': 'samsunginternet_android',
};

/**
 * @template {string} T
 * @param {string[]} browserslistResult
 * @param {{ [key in keyof BrowsersListNames]: T|false }} mapping
 * @returns {Partial<Record<T, string[]>>}
 */
const applyMapping = (browserslistResult, mapping) => {
  /** @type {Partial<Record<T, string[]>>} */
  const result = {};

  for (const pair of browserslistResult) {
    const [rawName, rawVersion] = pair.split(' ');

    if (!rawName || !rawVersion) continue;

    const sourceName = filterNonObjectKeys(mapping, rawName);
    if (!sourceName) {
      throw new Error(`Unmapped browser: ${rawName}`);
    }
    const name = mapping[sourceName];

    if (name === false) continue;

    let version = rawVersion;

    if (rawVersion.includes('-')) {
      const [part1, part2] = rawVersion.split('-');
      if (!part1 || !part2) {
        throw new Error(`Expected values on both sides of "-" in ${rawVersion}`);
      }
      version = part1.trim() + ' - ' + part2.trim();
    }

    const current = result[name];
    if (current) {
      current.push(version);
    } else {
      result[name] = [version];
    }
  }

  return result;
};

/**
 * @template T
 * @typedef {T extends string ? T : never} OnlyStrings
 */

/**
 * @template {Record<string, string|boolean>} T
 * @template V
 * @typedef {Partial<Record<OnlyStrings<import('type-fest').ValueOf<Mapping<T>>>, V>>} MapResult
 */

/**
 * @typedef BrowsersListMapping
 * @property {MapResult<BrowsersListToBCD, string[]>} bcdBrowsers
 * @property {MapResult<BrowsersListToPolyfill, string[]>} polyfillBrowsers
 */

/**
 * @param {string[]} browserslistResult
 * @returns {MapResult<BrowsersListToBCD, string[]>}
 */
export const mapBrowserslistToBCD = (browserslistResult) =>
  applyMapping(browserslistResult, browserslistBrowserToBCDBrowser);

/**
 * @param {string[]} browserslistResult
 * @returns {MapResult<BrowsersListToPolyfill, string[]>}
 */
export const mapBrowserslistToPolyfills = (browserslistResult) =>
  applyMapping(browserslistResult, browserslistBrowserToPolyfillBrowser);
