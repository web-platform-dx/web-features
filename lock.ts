import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import stringify from "fast-json-stable-stringify";
import YAML from "yaml";

import { FeatureData } from ".";

type Lock = {
  hash: string;
  compat_features?: string[];
};

export function lockout(filePath: string, featureData: FeatureData): Lock {
  const hash = md5(featureData);

  const featureKey = path.basename(filePath).split(".yml")[0];
  const lockFp = path.join(
    path.dirname(filePath),
    `${featureKey}.lockfile.yml`
  );

  const lockData: Lock = { hash };
  if ("compat_features" in featureData) {
    lockData.compat_features = lockCompatFeatures(featureData.compat_features);
  }

  fs.writeFileSync(lockFp, YAML.stringify(lockData), { encoding: "utf-8" });

  return lockData;
}

export function isLockfileFresh(feature: FeatureData, lockfile: Lock) {
  return md5(feature) === lockfile.hash;
}

function md5(data: FeatureData) {
  return crypto.createHash("md5").update(stringify(data)).digest("hex");
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
