import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { WebFeaturesData } from "./types";

const jsonPath = fileURLToPath(new URL("./data.json", import.meta.url));
const { features, groups, snapshots } = JSON.parse(
  readFileSync(jsonPath, { encoding: "utf-8" }),
) as WebFeaturesData;

export * from "./types";
export { features, groups, snapshots };
