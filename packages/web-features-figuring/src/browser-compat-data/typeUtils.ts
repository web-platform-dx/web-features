import {
  Browsers,
  BrowserStatement,
  CompatData,
  CompatStatement,
  Identifier,
  MetaBlock,
} from "@mdn/browser-compat-data";

export function isIndexable(o: unknown): o is Record<string, unknown> {
  if (typeof o === "object" && o !== null && Object.keys(o).length > 0) {
    return true;
  }
  return false;
}

function hasKeys(o: unknown, expectedKeys: string[]): boolean {
  return (
    isIndexable(o) && Object.keys(o).every((key) => expectedKeys.includes(key))
  );
}

// The root BCD object
export function isCompatData(o: unknown): o is CompatData {
  return (
    isIndexable(o) &&
    hasKeys(o, [
      "__meta",
      "browsers",
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
    ])
  );
}

export function isFeatureData(o: unknown): o is Identifier {
  return isIndexable(o) && !isBrowsers(o);
}

export function isBrowsers(o: unknown): o is Browsers {
  return (
    isIndexable(o) &&
    Object.keys(o).includes("chrome") &&
    Object.keys(o).includes("edge") &&
    Object.keys(o).includes("firefox") &&
    Object.keys(o).includes("safari")
  );
}

export function isBrowserStatement(o: unknown): o is BrowserStatement {
  return hasKeys(o, ["name", "type", "releases"]);
}

export function isCompatStatement(o: unknown): o is CompatStatement {
  return hasKeys(o, ["support"]);
}

export function isMetaBlock(o: unknown): o is MetaBlock {
  return hasKeys(o, ["version", "timestamp"]);
}
