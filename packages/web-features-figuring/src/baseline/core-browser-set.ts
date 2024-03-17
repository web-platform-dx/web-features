import { Temporal } from "@js-temporal/polyfill";

import { BASELINE_LOW_TO_HIGH_DURATION } from ".";
import { VERY_FAR_FUTURE_DATE } from "../browser-compat-data/browser";
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

function isBaselineHighRelease(release: Release) {
  const baselineHighCutoff = Temporal.Now.plainDateISO().subtract(
    BASELINE_LOW_TO_HIGH_DURATION,
  );
  return (
    Temporal.PlainDate.compare(
      release.date() ?? VERY_FAR_FUTURE_DATE,
      baselineHighCutoff,
    ) < 1
  );
}
