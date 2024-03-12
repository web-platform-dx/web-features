import bcd from "@mdn/browser-compat-data";
import { Browser, Feature, browser, feature, query } from ".";

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
}

export const defaultCompat = new Compat(bcd);
