import {
  FlagStatement,
  SimpleSupportStatement,
  VersionValue,
} from "@mdn/browser-compat-data";

import { Browser } from "./browser.js";
import { Feature } from "./feature.js";
import { Release } from "./release.js";

export interface Qualifications {
  prefix?: string;
  alternative_name?: string;
  flags?: FlagStatement[];
  partial_implementation?: true;
}

// TODO: This stuff is slow, clunky, and weirdly indirect. It was helpful to get
// started (especially before I knew all of the variations that a given
// statement could express), but we might be better served by extracting
// `supportedBy()` into something like an `expandToReleases(browser: Browser,
// statement: SimpleSupportStatement)` function or similar.

export function statement(
  incoming:
    | Partial<SimpleSupportStatement>
    | SupportStatement
    | RealSupportStatement,
  browser?: Browser,
  feature?: Feature,
): SupportStatement {
  if (incoming instanceof RealSupportStatement) {
    return incoming;
  }

  if (incoming instanceof SupportStatement) {
    return statement(incoming.data, browser, feature);
  }

  try {
    return new RealSupportStatement(incoming, browser, feature);
  } catch (err) {
    if (err instanceof NonRealValueError) {
      return new SupportStatement(incoming, browser, feature);
    }
    throw err;
  }
}

export class NonRealValueError extends Error {
  constructor(name: "version_added" | "version_removed", value: unknown) {
    super(`${name} of ${value} is not a BCD real value`);
  }
}

export class SupportStatement {
  data: Partial<SimpleSupportStatement>;
  browser: Browser | undefined;
  feature: Feature | undefined;

  constructor(
    data: Partial<SimpleSupportStatement>,
    browser?: Browser,
    feature?: Feature,
  ) {
    this.data = data;
    this.browser = browser;
    this.feature = feature;
  }

  _isRanged(key: "version_added" | "version_removed" | undefined): boolean {
    if (key === undefined) {
      return (
        this._isRanged("version_added") || this._isRanged("version_removed")
      );
    }

    const version = this.data?.[key];

    if (
      typeof version === "boolean" ||
      version === undefined ||
      version === null
    ) {
      return false;
    }

    return version.includes("≤");
  }

  get flags(): FlagStatement[] {
    return this.data?.flags ?? [];
  }

  get partial_implementation(): boolean {
    // Strictness guarantee: unset partial_implementation returns false
    return this.data?.partial_implementation ?? false;
  }

  /**
   * Get the `version_added` value, or false if unset.
   */
  get version_added(): VersionValue {
    if (this.data?.version_added === undefined) {
      return false;
    }
    return this.data?.version_added;
  }

  get version_removed(): VersionValue {
    // Strictness guarantee: unset version_removed returns false
    return this.data?.version_removed || false;
  }
}

export class RealSupportStatement extends SupportStatement {
  constructor(
    data: Partial<SimpleSupportStatement>,
    browser?: Browser,
    feature?: Feature,
  ) {
    // Strictness guarantee: Support statements never contain non-real values

    super(data, browser, feature);

    if (!Object.hasOwn(data, "version_added")) {
      throw new Error("version_added missing from simple support statement");
    }

    const { version_added } = data;
    if (!(typeof version_added === "string" || version_added === false)) {
      throw new NonRealValueError("version_added", version_added);
    }

    if (Object.hasOwn(data, "version_removed")) {
      const { version_removed } = data;
      if (!(typeof version_removed === "string" || version_removed === false)) {
        throw new NonRealValueError("version_added", version_removed);
      }
    }
  }

  get version_added() {
    return super.version_added as string | false;
  }

  get version_removed() {
    return super.version_removed as string | false;
  }

  // TODO: `supportedBy()` ought to be (partially) implemented on non-real value
  // support statements. For example, `"version_added": true` should allow for
  // returning `[this.browser.current()]` at least.
  supportedBy(): { release: Release; qualifications?: Qualifications }[] {
    if (this.browser === undefined) {
      throw Error("This support statement's browser is unknown.");
    }

    if (this.version_added === false) {
      return [];
    }

    let start: Release;
    if (this.version_added.startsWith("≤")) {
      start = this.browser.version(this.version_added.slice(1));
    } else {
      start = this.browser.version(this.version_added);
    }

    let releases;
    if (this.version_removed === undefined) {
      releases = this.browser.releases.filter((rel) => rel.inRange(start));
    } else {
      const end: Release = this.browser.version(this.version_removed);
      releases = this.browser.releases.filter((rel) => rel.inRange(start, end));
    }

    let qualifications: Qualifications = statementToQualifications(this);
    if (Object.keys(qualifications).length) {
      return releases.map((release) => ({ release, qualifications }));
    }
    return releases.map((release) => ({
      release,
    }));
  }
}

function statementToQualifications(
  statement: SupportStatement,
): Qualifications {
  let qualifications: Qualifications = {};
  if (statement.data.prefix) {
    qualifications.prefix = statement.data.prefix;
  }
  if (statement.data.alternative_name) {
    qualifications.alternative_name = statement.data.alternative_name;
  }
  if (statement.flags.length) {
    qualifications.flags = statement.flags;
  }
  if (statement.partial_implementation) {
    qualifications.partial_implementation = statement.partial_implementation;
  }
  return qualifications;
}
