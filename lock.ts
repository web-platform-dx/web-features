import fs from "node:fs";
import path from "node:path";

import stringify from "fast-json-stable-stringify";
import YAML from "yaml";

import { FeatureData } from ".";

export function lockout(filePath: string, featureData: FeatureData) {
  const featureKey = path.basename(filePath).split(".yml")[0];
  const lockFp = path.join(
    path.dirname(filePath),
    `${featureKey}.lockfile.yml`
  );

  const lockData = resolve(featureData);
  fs.writeFileSync(lockFp, YAML.stringify(lockData), { encoding: "utf-8" });

  return lockData;
}

export function isLockfileFresh(feature: FeatureData, lockfile: FeatureData) {
  return stringify(resolve(feature)) === stringify(lockfile);
}

const resolvers = {
  compat_features: lockCompatFeatures,
};

function resolve(feature: FeatureData) {
  const resolved: Partial<FeatureData> = {};

  for (const [key, value] of Object.entries(feature)) {
    if (key === "compat_features") {
      resolved[key] = lockCompatFeatures(value);
    }
  }

  return resolved as FeatureData;
}

function lockCompatFeatures(compatFeatures: string[]): string[] {
  const resolved = [];

  for (const unresolved of compatFeatures) {
    if (unresolved.includes("*")) {
      resolved.push(...expandCompat(unresolved));
    } else {
      resolved.push(unresolved);
    }
  }

  return resolved;
}

function expandCompat(directive: string) {
  if (directive.at(-1) !== "*") {
    // Only trailing expansions are allowed, perhaps ever?
    throw new Error("Not implemented (inner wildcards)");
  }
  const [head, _] = directive.split(".*");
  // TODO: Walk BCD features from head to all descendant __compat features
  return [
    `${head}.a (fake)`,
    `${head}.b (fake)`,
    `${head}.c (Fake)`,
    `${head}.d (Fake)`,
  ];
}
