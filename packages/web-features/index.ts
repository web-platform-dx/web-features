import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const jsonPath = fileURLToPath(new URL("./index.json", import.meta.url));
const features = JSON.parse(readFileSync(jsonPath, { encoding: "utf-8" }));

export default features;
