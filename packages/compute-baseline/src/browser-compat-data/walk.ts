import {
  BrowserStatement,
  Browsers,
  CompatData,
  CompatStatement,
  Identifier,
  MetaBlock,
} from "@mdn/browser-compat-data";
import { query } from "./query.js";
import { isBrowserStatement, isFeatureData } from "./typeUtils.js";
import { descendantKeys } from "./walkUtils.js";

type BCD =
  | CompatData
  | Browsers
  | BrowserStatement
  | CompatStatement
  | Identifier
  | MetaBlock;

interface LowLevelWalkResult {
  path: string;
  data: BCD;
  compat?: CompatStatement;
  browser?: BrowserStatement;
}

function* lowLevelWalk(
  data: BCD | CompatData,
  path?: string,
  depth = Infinity,
): Generator<LowLevelWalkResult> {
  if (path !== undefined) {
    const next: LowLevelWalkResult = {
      path,
      data,
    };

    if (isBrowserStatement(data)) {
      next.browser = data;
    } else if (isFeatureData(data)) {
      next.compat = data.__compat;
    }
    yield next;
  }

  if (depth > 0) {
    for (const key of descendantKeys(data, path)) {
      // TODO: can anything be done about this "as"?
      yield* lowLevelWalk(
        data[key as keyof BCD],
        joinPath(path, key),
        depth - 1,
      );
    }
  }
}

function joinPath(...pathItems: (string | undefined)[]) {
  return pathItems.filter((item) => item !== undefined).join(".");
}

export function* walk(entryPoints: string | string[], data: BCD) {
  const walkers = [];

  if (entryPoints === undefined) {
    walkers.push(lowLevelWalk(data));
  } else {
    entryPoints = Array.isArray(entryPoints) ? entryPoints : [entryPoints];
    walkers.push(
      ...entryPoints.map((entryPoint) => {
        const queryResult = query(entryPoint, data);
        if (isFeatureData(queryResult)) {
          return lowLevelWalk(queryResult, entryPoint);
        }
        throw new Error("Unhandled traverse target");
      }),
    );
  }

  for (const walker of walkers) {
    for (const step of walker) {
      if (step.compat) {
        yield step;
      }
    }
  }
}
