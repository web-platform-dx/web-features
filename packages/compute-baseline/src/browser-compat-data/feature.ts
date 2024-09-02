import { Identifier, SimpleSupportStatement } from "@mdn/browser-compat-data";
import { Browser } from "./browser.js";
import { Compat, defaultCompat } from "./compat.js";
import { Release } from "./release.js";
import {
  Qualifications,
  RealSupportStatement,
  statement,
  Supported,
  SupportStatement,
  UnknownSupport,
  Unsupported,
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
      throw new Error(`${id} is not valid feature`);
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

  get standard_track(): boolean {
    return this.data.__compat?.status?.standard_track ?? false;
  }

  /**
   * Get this feature's support statement data, for a given browser.
   */
  rawSupportStatements(browser: Browser): SimpleSupportStatement[] {
    const support = this.data?.__compat?.support;
    if (support === undefined) {
      throw new Error("This feature contains no __compat object.");
    }

    const statementOrStatements = support[browser.id];
    if (statementOrStatements === undefined) {
      throw new Error(`${this} contains no support data for ${browser.name}`);
    }

    return Array.isArray(statementOrStatements)
      ? statementOrStatements
      : [statementOrStatements];
  }

  /**
   * Get this feature's `SupportStatement` or `RealSupportStatement` objects,
   * for a given browser.
   */
  supportStatements(browser: Browser): SupportStatement[] {
    return this.rawSupportStatements(browser).map((raw) =>
      statement(raw, browser, this),
    );
  }

  /**
   * Find out whether this feature's support data says that a given browser
   * release is supported (with or without qualifications), unsupported, or
   * unknown.
   */
  supportedInDetails(
    release: Release,
  ): (Supported | Unsupported | UnknownSupport)[] {
    const result = [];
    for (const s of this.supportStatements(release.browser)) {
      this.assertRealSupportStatement(s, release.browser);

      result.push(s.supportedInDetails(release));
    }
    return result;
  }

  /**
   * Find out whether this feature's support data says that a given browser
   * release is supported (`true`), unsupported (`false`), or unknown (`null`).
   * Note that this ignores qualifications such as partial implementations,
   * prefixes, alternative names, and flags.
   */
  supportedIn(release: Release): boolean | null {
    let unknown = false;
    for (const s of this.supportStatements(release.browser)) {
      this.assertRealSupportStatement(s, release.browser);

      const supported = s.supportedInDetails(release);
      if (supported.supported && !supported.qualifications) {
        return true;
      }

      if (supported.supported === null) {
        unknown = true;
      }
    }
    if (unknown) {
      return null;
    }
    return false;
  }

  _supportedBy(
    browser: Browser,
  ): { release: Release; qualifications?: Qualifications }[] {
    const result = [];
    for (const s of this.supportStatements(browser)) {
      this.assertRealSupportStatement(s, browser);

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

  /**
   * Throws when a support statement contains non-real values.
   */
  assertRealSupportStatement(
    statement: SupportStatement,
    browser: Browser,
  ): asserts statement is RealSupportStatement {
    if (!(statement instanceof RealSupportStatement))
      throw new Error(
        `${this.id} contains non-real values for ${browser.name}. Cannot expand support.`,
      );
  }
}
