import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import url from 'url';

import { DefinedError } from "ajv";
import * as data from '../index.js';
import { validate } from "./validate.js";

let status: 0 | 1 = 0;

function checkSchemaConsistency(): void {
    const schemaPath: string = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "../schemas/data.schema.json");
    const schemaOnDisk: string = fs.readFileSync(schemaPath, { encoding: "utf-8"});
    const schemaGenerated: string = child_process.execSync("npm run --silent schema", { encoding: "utf-8"}).trim();

    if (schemaOnDisk !== schemaGenerated) {
        console.error("There's a mismatch between the schema on disk and types in `index.ts`.");
        console.error("This may produce misleading results for feature validation.");
        console.error("To fix this, run `npm run schema:write`.");
        status = 1;
    }
}

function valid() {
    const valid = validate(data);
    if (!valid) {
        // TODO: turn on strictNullChecks, fix all the errors, and replace this with:
        // const errors = validate.errors;
        const errors = (validate as any).errors as DefinedError[];
        for (const error of errors) {
            console.error(`${error.instancePath}: ${error.message}`);
        }
        status = 1;
    }
}

checkSchemaConsistency();
valid();
process.exit(status);
