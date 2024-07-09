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

export type Supported = { supported: true; qualifications?: Qualifications };
export type Unsupported = { supported: false };
export type UnknownSupport = { supported: null };

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

  get version_removed(): string | boolean | undefined {
    const value = this.data?.version_removed;

    // TODO: Report and fix upstream bug in BCD, then uncomment or drop the code
    // below

    // According to @mdn/browser-compat-data's schema, `version_removed` values
    // should only be `true` or strings. In practice (and according to the
    // exported types), this is not the case, because mirroring inserts `false`
    // values.

    // if (value === null || value === false) {
    //   throw new Error(
    //     "`version_added` should never be `null` or `false`. This is a bug, so please file an issue!",
    //   );
    // }
    if (value === null) {
      throw new Error(
        "`version_added` should never be `null`. This is a bug, so please file an issue!",
      );
    }

    return value;
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

  get version_added(): string | false {
    return super.version_added as string | false;
  }

  get version_removed(): string | false | undefined {
    return super.version_removed as string | false | undefined;
  }

  /**
   * Find out whether this support statement says a given browser release is
   * supported (with or without qualifications), unsupported, or unknown.
   */
  supportedIn(release: Release): Supported | Unsupported | UnknownSupport {
    if (this.browser === undefined) {
      throw new Error("This support statement's browser is unknown.");
    }

    if (release.browser !== this.browser) {
      throw new Error(
        "Browser-release mismatch. The release is not part of the statement's browser's set of releases.",
      );
    }

    if (this.version_added === false) {
      return { supported: false };
    }

    // From here, some releases might be supporting
    const qualifications = statementToQualifications(this);
    const asSupported = Boolean(Object.keys(qualifications).length)
      ? { supported: true, qualifications }
      : { supported: true };

    // Let's deal with the most fiendish case first:
    // { version_added: "≤", version_removed: "≤…" }
    // That is, a case where unknown values are in two version ranges:
    // - Supported in version_added
    // - Unsupported from version_removed
    // - Unknown before version_added
    // - Unknown from version_added + 1 to removed (exclusive)
    if (
      isRangedVersion(this.version_added) &&
      isRangedVersion(this.version_removed)
    ) {
      const supportedIn = this.browser.version(
        this.version_added.replaceAll("≤", ""),
      ) as Release;
      const unsupportedFrom = this.browser.version(
        this.version_removed.replaceAll("≤", ""),
      ) as Release;

      if (release === supportedIn) {
        return asSupported;
      }
      if (release.inRange(unsupportedFrom)) {
        return { supported: false };
      }
      return { supported: null };
    }

    const initial = this.browser.releases[0] as Release;

    // The other fiendish case is:
    // { version_added: "…", version_removed: "≤…" }
    // That is, cases such that:
    // - Supported in version_added
    // - Unsupported before version_added
    // - Unsupported from version_removed
    // - Unknown from version_added + 1 to removed (exclusive)
    if (
      isFixedVersion(this.version_added) &&
      isRangedVersion(this.version_removed)
    ) {
      const supportedIn = this.browser.version(this.version_added);
      const unsupportedFrom = this.browser.version(
        this.version_removed.replaceAll("≤", ""),
      ) as Release;

      if (release === supportedIn) {
        return asSupported;
      }
      if (
        release.inRange(unsupportedFrom) ||
        release.inRange(initial, supportedIn)
      ) {
        return { supported: false };
      }
      return { supported: null };
    }

    const start = this.browser.version(this.version_added.replaceAll("≤", ""));
    const startRanged = isRangedVersion(this.version_added);

    const end: Release | undefined =
      typeof this.version_removed === "string"
        ? this.browser.version(this.version_removed)
        : undefined;

    if (release.inRange(start, end)) {
      return asSupported;
    }
    if (startRanged && release.inRange(initial, start)) {
      return { supported: null };
    }
    return { supported: false };
  }

  supportedBy(): { release: Release; qualifications?: Qualifications }[] {
    if (this.browser === undefined) {
      throw new Error("This support statement's browser is unknown.");
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
    if (this.version_removed === undefined || this.version_removed === false) {
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

function isRangedVersion(s: any): s is string {
  return typeof s === "string" && s.startsWith("≤");
}

function isFixedVersion(s: any): s is string {
  return typeof s === "string" && !s.startsWith("≤");
}
