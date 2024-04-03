import bcd, { CompatData } from "@mdn/browser-compat-data";
import { Browser, Feature, browser, feature, query, walk } from ".";

export class Compat {
  data: unknown;
  browsers: Map<string, Browser>;
  features: Map<string, Feature>;

  constructor(data: unknown = bcd) {
    this.data = data;
    this.browsers = new Map();
    this.features = new Map();
  }

  query(path: string) {
    return query(path, this.data);
  }

  browser(id: string): Browser {
    return browser(id, this);
  }

  feature(id: string): Feature {
    return feature(id, this);
  }

  /**
   * Generate `Feature` objects by walking tree of features.
   *
   * Similar to the `traverse` command in mdn/browser-compat-data.
   *
   * @param {string[]} [entryPoints] An array of dotted paths to compat features (e.g., `css.properties.background-color`)
   */
  *walk(entryPoints?: string[]): Generator<Feature> {
    const defaultEntryPoints = Object.keys(this.data as CompatData).filter(
      (key) => !["__meta", "browsers"].includes(key),
    );
    entryPoints = entryPoints ?? defaultEntryPoints;

    for (const { path } of walk(entryPoints, this.data as CompatData)) {
      yield this.feature(path);
    }
  }
}

export const defaultCompat = new Compat(bcd);
