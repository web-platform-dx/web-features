import { Identifier } from "@mdn/browser-compat-data";

import { Browser } from "./browser.js";
import { Compat, defaultCompat } from "./compat.js";
import { Release } from "./release.js";
import {
  Qualifications,
  RealSupportStatement,
  statement,
} from "./supportStatements.js";
import { isFeatureData } from "./typeUtils.js";

export function feature(id: string, compat: Compat = defaultCompat): Feature {
  let f = compat.features.get(id);
  if (f) {
    return f;
  }

  f = new Feature(id, compat.query(id) as Identifier);
  compat.features.set(id, f);
  return f;
}

export class Feature {
  id: string; // dotted.path.to.feature
  data: Identifier; // underlying BCD object

  constructor(id: string, featureData: unknown) {
    if (!isFeatureData(featureData)) {
      throw `${id} is not valid feature`;
    }

    this.id = id;
    this.data = featureData;
  }

  toString() {
    return `[Feature ${this.id}]`;
  }

  /**
   * The deprecation status of this feature, if known.
   */
  get deprecated(): boolean | undefined {
    return this.data.__compat?.status?.deprecated;
  }

  /**
   * The feature's tags as an array (whether there are any tags or not).
   */
  get tags(): string[] {
    return this.data.__compat?.tags ?? [];
  }

  get mdn_url(): string | undefined {
    return this.data.__compat?.mdn_url;
  }

  /**
   * The feature's specification URLs as an array (whether there are any URLs or
   * not).
   */
  get spec_url(): string[] {
    const underlying = this.data.__compat?.spec_url;
    if (underlying) {
      return Array.isArray(underlying) ? underlying : [underlying];
    }
    return [];
  }

  _supportedBy(
    browser: Browser,
  ): { release: Release; qualifications?: Qualifications }[] {
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

    const result = [];
    for (const raw of rawStatements) {
      const s = statement(raw, browser, this);

      if (!(s instanceof RealSupportStatement)) {
        throw Error(
          `${this.id} contains non-real values for ${browser.name}. Cannot expand support.`,
        );
      }

      result.push(...s.supportedBy());
    }

    return result;
  }

  supportedBy(options?: { only?: Browser[]; compat?: Compat }) {
    const compat =
      options?.compat === undefined ? defaultCompat : options.compat;
    const browsers = options?.only
      ? options.only
      : Object.keys(this.data?.__compat?.support || {}).map((id) =>
          compat.browser(id),
        );

    const result = [];
    for (const b of browsers) {
      result.push(...this._supportedBy(b));
    }
    return result;
  }
}
