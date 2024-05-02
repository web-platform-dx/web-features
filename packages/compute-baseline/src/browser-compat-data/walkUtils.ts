import {
  isBrowserStatement,
  isCompatData,
  isCompatStatement,
  isFeatureData,
  isMetaBlock,
} from "./typeUtils.js";

export function descendantKeys(data: unknown, path?: string): string[] {
  if (isCompatData(data)) {
    return [
      "api",
      "css",
      "html",
      "http",
      "javascript",
      "mathml",
      "svg",
      "webassembly",
      "webdriver",
      "webextensions",
    ];
  }

  if (isMetaBlock(data)) {
    return [];
  }

  if (isCompatStatement(data)) {
    return [];
  }

  if (isBrowserStatement(data)) {
    return [];
  }

  if (isFeatureData(data)) {
    return Object.keys(data).filter((key) => key !== "__compat");
  }

  throw Error(
    `Unhandled traverse into descendants of object at ${path ?? "[root]"}`,
  );
}
