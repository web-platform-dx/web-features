/**
 * @template {{ [key: string]: any }} Input
 * @template {string} Key
 * @param {Input} input
 * @param {Key} key
 * @returns {keyof Input | undefined}
 */
export const filterNonObjectKeys = (input, key) => {
  return Object.hasOwn(input, key) ? key : undefined;
};

/**
 * @template {{ [key: string]: any }} T
 * @param {T} value
 * @returns {Array<keyof T>}
 */
export const typedObjectKeys = (value) => {
  return Object.keys(value);
};

/**
 * @template T
 * @param {T[]|T} value
 * @returns {T[]}
 */
export const ensureArray = (value) =>
  Array.isArray(value) ? value : [value];
