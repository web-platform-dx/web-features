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
  const baselineHighCutoff = new Date();
  baselineHighCutoff.setMonth(baselineHighCutoff.getMonth() - 30);
  return release.date() >= baselineHighCutoff;
}
