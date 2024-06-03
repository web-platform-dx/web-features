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

export function browsers(compat: Compat) {
  return identifiers.map((b) => compat.browser(b));
}
