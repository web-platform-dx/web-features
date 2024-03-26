import { Temporal } from "@js-temporal/polyfill";

import { BASELINE_LOW_TO_HIGH_DURATION } from "../constants";
import { Compat } from "../browser-compat-data/compat";
import { Release } from "../browser-compat-data/release";

export const identifiers = [
  "chrome",
  "chrome_android",
  "edge",
  "firefox",
  "firefox_android",
  "safari",
  "safari_ios",
];

export function browsers(compat: Compat) {
  return identifiers.map((b) => compat.browser(b));
}

export function lowReleases(compat: Compat) {
  return browsers(compat).map((b) => b.current());
}

export function highReleases(compat: Compat) {
  return browsers(compat)
    .flatMap((b) => b.releases())
    .filter(isBaselineHighRelease);
}

export function isBaselineHighRelease(release: Release) {
  const now = Temporal.Now.plainDateISO();

  // Exclude undated or future-dated releases from Baseline consideration
  if (!release.date || Temporal.PlainDate.compare(now, release.date) === -1) {
    return false;
  }

  const baselineHighCutoff = now.subtract(BASELINE_LOW_TO_HIGH_DURATION);
  return Temporal.PlainDate.compare(release.date, baselineHighCutoff) >= 0;
}
