import {
  FlagStatement,
  SimpleSupportStatement,
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

export class SupportStatement {
  data: SimpleSupportStatement;
  browser: Browser | undefined;
  feature: Feature | undefined;

  constructor(
    data: SimpleSupportStatement,
    browser?: Browser,
    feature?: Feature,
  ) {
    this.data = data;
    this.browser = browser;
    this.feature = feature;
  }

  /**
   * An array of `FlagStatement` objects. If there are no flags, then the array
   * is empty.
   */
  get flags(): FlagStatement[] {
    return this.data?.flags ?? [];
  }

  /**
   * A `true` value when evidence of support exists, such an API exposure, but
   * its behavior is irregular (for example, by deviating from the
   * specification). Otherwise, `false`.
   */
  get partial_implementation(): boolean {
    return this.data?.partial_implementation ?? false;
  }

  /**
   * A version string for the first supporting release. If the feature was never
   * supported, then it is `false`.
   */
  get version_added(): string | false {
    return this.data?.version_added ?? false;
  }

  /**
   * A version string for the first unsupporting release after `version_added`.
   * If the feature is still supported, then it is `undefined`.
   */
  get version_removed(): string | undefined {
    return this.data?.version_removed;
  }

  supportedInDetails(
    release: Release,
  ): Supported | Unsupported | UnknownSupport {
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

    const end: Release | undefined = this.version_removed
      ? this.browser.version(this.version_removed)
      : undefined;

    let releases = this.browser.releases.filter((rel) =>
      rel.inRange(start, end),
    );

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
