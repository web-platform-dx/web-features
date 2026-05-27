import winston from "winston";
import { tagsToFeatures } from "./compat-helpers";
import { FeatureData } from "./types";

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: new winston.transports.Console(),
});

interface CompatSets {
  core: string[];
  modifier: string[];
  spare: string[];
}

interface AuthoredCompatSets {
  core: string[];
  modifier?: string[];
  spare?: string[];
}

export interface ParsedAuthoredData extends Partial<FeatureData> {
  compatFeatures: CompatSets & { all: string[] };
}

export function parseAuthoring(
  id: string,
  authored: unknown,
): ParsedAuthoredData {
  // NB: This function doesn't actually parse most of a feature entry. Right
  // now, it handles compat_features and compute_from statuses. There's more to
  // be done here to get complete parsing, but it's probably not time well spent
  // before writing a formal schema for authored YAML files and perhaps adopting
  // a validation library like zod.

  if (!isRecord(authored)) {
    throw new Error(`Expected authored data object, got ${authored}`);
  }

  // There are six ways to specify the compat keys for a feature and which of
  // those keys to use to compute a status. In order of precedence, they are:
  //
  // - compat sets
  //     compat_features object with sets of keys in an authored YAML file
  // - compute_from and flat compat_features
  //     compute_from and compat_features array in an authored YAML file
  // - compute_from and implicit keys
  //     compute_from in an authored YAML file and keys from a BCD tag
  // - flat compat_features
  //     compat_features array in an authored YAML file
  // - implicit keys
  //     keys from a BCD tag
  // - keyless
  //     no enumerated keys
  //
  // This following if statement finds the first matching style, then sorts the
  // keys into buckets accordingly.

  let compatFeatures: CompatSets;
  if (isAuthoredCompatSets(authored.compat_features)) {
    logger.debug(`${id} has explicit compat sets`);
    compatFeatures = makeCompatSets(authored.compat_features);
  } else if (
    isComputeFromOverride(authored.status) &&
    Array.isArray(authored.compat_features)
  ) {
    logger.debug(`${id} has compute_from and flat compat_features`);
    compatFeatures = makeCompatSets(
      authored.compat_features,
      parseComputeFrom(authored.status.compute_from),
    );
  } else if (
    isComputeFromOverride(authored.status) &&
    authored.compat_features === undefined
  ) {
    logger.debug(`${id} has compute_from and implicit keys`);
    compatFeatures = makeCompatSets(
      id,
      parseComputeFrom(authored.status.compute_from),
    );
  } else if (Array.isArray(authored.compat_features)) {
    logger.debug(`${id} has flat compat_features`);
    compatFeatures = makeCompatSets(authored.compat_features);
  } else {
    logger.debug(`${id} has implicit keys or is keyless`);
    compatFeatures = makeCompatSets(id);
  }

  return {
    compatFeatures: {
      all: [
        ...compatFeatures.core,
        ...compatFeatures.modifier,
        ...compatFeatures.spare,
      ].toSorted(),
      ...compatFeatures,
    },
  };
}

// FIXME: `makeCompatSets()` has several signatures, which made it easier to
// write tests and get tab completion. Admittedly, it's a lot of not-terribly
// pretty lines at the point of implementation. I think the pros outweigh the
// cons here, but we can drop this before merging the PR, if desired.

/*
 * Construct a CompatSets object from one of the authorable structures or data
 * sources.
 */
export function makeCompatSets(set: AuthoredCompatSets): CompatSets;
export function makeCompatSets(
  keys: string[],
  computeFrom: [string, ...string[]],
): CompatSets;
export function makeCompatSets(
  id: string,
  computeFrom: [string, ...string[]],
): CompatSets;
export function makeCompatSets(keys: string[]): CompatSets;
export function makeCompatSets(
  id: string,
  computeFrom: [string, ...string[]],
): CompatSets;
export function makeCompatSets(id: string): CompatSets;
export function makeCompatSets(): CompatSets;
export function makeCompatSets(
  setsOrKeysOrId?: AuthoredCompatSets | string[] | string,
  computeFrom?: [string, ...string[]],
): CompatSets {
  if (setsOrKeysOrId === undefined) {
    return {
      core: [],
      modifier: [],
      spare: [],
    };
  }

  if (isAuthoredCompatSets(setsOrKeysOrId)) {
    const sets = setsOrKeysOrId;
    return {
      core: (sets.core ? sets.core : []).toSorted(),
      modifier: (sets.modifier ? sets.modifier : []).toSorted(),
      spare: (sets.spare ? sets.spare : []).toSorted(),
    };
  }

  const keys: string[] = Array.isArray(setsOrKeysOrId)
    ? setsOrKeysOrId
    : idToKeys(setsOrKeysOrId);

  if (computeFrom) {
    for (const key of computeFrom) {
      if (!keys.includes(key)) {
        throw new Error(`${key} is not a member of ${keys}`);
      }
    }

    return {
      core: computeFrom.toSorted(),
      modifier: [],
      spare: keys.filter((k) => !computeFrom.includes(k)).toSorted(),
    };
  }
  return {
    core: keys.toSorted(),
    modifier: [],
    spare: [],
  };
}

function idToKeys(id: string): string[] {
  const expectedTag = `web-features:${id}`;
  const bcdFeatures = tagsToFeatures.get(expectedTag) ?? [];
  return bcdFeatures.map((f) => f.id);
}

function isRecord(
  value: unknown,
): value is Record<string | number | symbol, unknown> {
  return typeof value === "object" && value !== null;
}

function isComputeFromOverride(
  value: unknown,
): value is { compute_from: string[] | string } {
  if (isRecord(value) && "compute_from" in value) {
    const { compute_from } = value;
    return Array.isArray(compute_from) || typeof compute_from === "string";
  }
}

function isAuthoredCompatSets(value: unknown): value is AuthoredCompatSets {
  return (
    isRecord(value) && ["core", "modifier", "spare"].some((key) => key in value)
  );
}

function parseComputeFrom(value: unknown): [string, ...string[]] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    const first = value[0];
    if (first === undefined) {
      throw new Error(`compute_from must have a minimum length of 1`);
    }
    for (const key of value) {
      if (typeof key !== "string") {
        throw new Error(
          `${key} in compute value array ${JSON.stringify(value)} is not a string`,
        );
      }
    }
    return [first, ...value.slice(1)];
  }
  throw new Error(`${value} is not a well-formed compute_from`);
}
