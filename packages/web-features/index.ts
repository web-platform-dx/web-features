import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { WebFeaturesData } from "./types";

const jsonPath = fileURLToPath(new URL("./data.json", import.meta.url));
const { bcd_version, browsers, features, groups, snapshots } = JSON.parse(
  readFileSync(jsonPath, { encoding: "utf-8" }),
) as WebFeaturesData;

export { bcd_version, browsers, features, groups, snapshots };
