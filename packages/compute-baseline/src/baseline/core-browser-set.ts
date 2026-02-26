import { Compat } from "../browser-compat-data/compat.js";

export const identifiers = [
  "chrome",
  "chrome_android",
  "edge",
  "firefox",
  "firefox_android",
  "safari",
  "safari_ios",
];

export const webViewIdentifiers = ["webview_android", "webview_ios"];

export function browsers(compat: Compat) {
  return identifiers.map((b) => compat.browser(b));
}

export function webViews(compat: Compat) {
  return webViewIdentifiers.map((b) => compat.browser(b));
}

export function allBrowsers(compat: Compat) {
  return [...browsers(compat), ...webViews(compat)];
}
