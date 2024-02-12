import { browser } from "../browser-compat-data/browser";
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

export const browsers = identifiers.map((b) => browser(b));

export const lowReleases = browsers.map((b) => b.current());

export const highReleases = browsers
  .flatMap((b) => b.releases())
  .filter(isBaselineHighRelease);

function isBaselineHighRelease(release: Release) {
  const baselineHighCutoff = new Date();
  baselineHighCutoff.setMonth(baselineHighCutoff.getMonth() - 30);
  return release.date() >= baselineHighCutoff;
}
