import assert from "node:assert/strict";
import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import url from 'url';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import * as data from '../index.js';

import schema from '../schemas/data.schema.json' assert { type: 'json' };

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

function validate() {
    const ajv = new Ajv({allErrors: true});
    addFormats(ajv);

    const validate = ajv.compile(schema);

    // confidence check that the schema finds any errors at all
    assert.equal(validate({}), false)

    const valid = validate(data);
    if (!valid) {
        for (const error of validate.errors) {
            console.error(`${error.instancePath}: ${error.message}`);
        }
        status = 1;
    }
}

checkSchemaConsistency();
validate();
process.exit(status);
