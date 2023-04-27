import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const jsonPath = fileURLToPath(new URL("./index.json", import.meta.url));
const features = JSON.parse(readFileSync(jsonPath, { encoding: "utf-8" }));

export default features;
