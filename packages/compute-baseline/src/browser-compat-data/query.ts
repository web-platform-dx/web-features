import { isIndexable } from "./typeUtils.js";

// TODO: Name this better. There's nothing so sophisticated as a "query" here.
// It's a boring lookup!
export function query(path: string, data: unknown) {
  const pathElements = path.split(".");
  let lookup = data;
  while (pathElements.length) {
    const next = pathElements.shift()!;

    if (!isIndexable(lookup) || !(next in lookup)) {
      throw new Error(`${path} is unindexable at '${next}'`);
    }
    lookup = lookup[next];
  }
  return lookup;
}
