import { Identifier } from "@mdn/browser-compat-data";

import { Browser, browser } from "./browser";
import { query } from "./query";
import { isFeatureData } from "./typeUtils";
import { Release } from "./release";
import { RealSupportStatement, statement } from "./supportStatements";

const knownFeatures = new Map<string, Feature>();

export function feature(id: string, data?: Identifier): Feature {
  if (data) {
    return new Feature(id, data);
  }

  const lookup = knownFeatures.get(id);
  if (lookup) {
    return lookup;
  }

  const f = new Feature(id, data);
  knownFeatures.set(id, f);
  return f;
}

export class Feature {
  id: string; // dotted.path.to.feature
  data: Identifier; // underlying BCD object

  constructor(id: string, featureData: Identifier | undefined) {
    let data;

    if (featureData === undefined) {
      data = query(id);
    } else {
      data = featureData;
    }

    if (!isFeatureData(data)) {
      throw `${id} is not valid feature`;
    }

    this.id = id;
    this.data = data;
  }

  toString() {
    return `[Feature ${this.id}]`;
  }

  get mdn_url(): string | undefined {
    return this.data.__compat?.mdn_url;
  }

  _supportedBy(browser: Browser): Release[] {
    const support = this.data?.__compat?.support;
    if (support === undefined) {
      throw Error("This feature contains no __compat object.");
    }

    const statementOrStatements = support[browser.id];

    if (statementOrStatements === undefined) {
      throw Error(`${this} contains no support data for ${browser.name}`);
    }

    const rawStatements = Array.isArray(statementOrStatements)
      ? statementOrStatements
      : [statementOrStatements];

    const releases: Release[] = [];
    const caveats: string[] = [];

    for (const raw of rawStatements) {
      const s = statement(raw, browser.id, this);

      if (!(s instanceof RealSupportStatement)) {
        throw Error(
          `${feature} contains non-real values. Cannot expand support.`,
        );
      }
      if (s.hasCaveats()) {
        const message = `${this} has support caveats in ${browser.name} and may be deemed unsupported. Check underlying compat data for details.`;
        caveats.push(message);
      }

      releases.push(...s.supportedBy());
    }

    if (releases.length === 0 && caveats.length > 0) {
      for (const message of caveats) {
        console.warn(message);
      }
    }

    return releases;
  }

  supportedBy(options?: { only?: Browser[]; omit?: Browser[] }): Release[] {
    const includables = options?.only ? new Set(options.only) : null;
    const ignorables = new Set(options?.omit ?? []);

    const browserIds = Object.keys(this.data?.__compat?.support || {});
    const browsers = browserIds.map((id) => browser(id));

    const result = [];
    for (const b of browsers) {
      if (!ignorables.has(b) && (includables === null || includables.has(b))) {
        result.push(...this._supportedBy(b));
      }
    }

    return result;
  }
}
