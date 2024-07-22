import { Temporal } from "@js-temporal/polyfill";
import { ReleaseStatement } from "@mdn/browser-compat-data";

import { Browser } from "./browser.js";

export class Release {
  browser: Browser;
  version: string;
  data: ReleaseStatement;
  releaseIndex: number;

  constructor(
    browser: Browser,
    version: string,
    data: ReleaseStatement,
    index: number,
  ) {
    this.browser = browser;
    this.version = version;
    this.data = data;
    this.releaseIndex = index;
  }

  toString() {
    return `[${this.browser.name} ${this.version}]`;
  }

  get date(): Temporal.PlainDate | null {
    const { release_date } = this.data;
    if (release_date === undefined) {
      return null;
    }

    return Temporal.PlainDate.from(release_date);
  }

  compare(otherRelease: Release) {
    if (otherRelease.browser !== this.browser) {
      throw new Error(
        `Cannot compare releases of differing browsers (${this.browser} versus ${otherRelease.browser})`,
      );
    }

    return this.releaseIndex - otherRelease.releaseIndex;
  }

  /**
   * Check if this release is the same as or after a starting release and,
   * optionally, before an ending release.
   */
  inRange(start: Release, end?: Release): boolean {
    const onOrAfterStart = this.compare(start) >= 0;
    if (end) {
      const beforeEnd = this.compare(end) < 0;
      return onOrAfterStart && beforeEnd;
    }
    return onOrAfterStart;
  }

  isPrerelease(): boolean {
    if (["beta", "nightly", "planned"].includes(this.data.status)) {
      return true;
    }
    return false;
  }
}
