import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { FeatureData } from "./types";

const jsonPath = fileURLToPath(new URL("./index.json", import.meta.url));
const features = JSON.parse(readFileSync(jsonPath, { encoding: "utf-8" })) as { [id: string]: FeatureData };

export default features;
