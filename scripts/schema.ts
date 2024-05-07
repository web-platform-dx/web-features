import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import url from 'url';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import * as data from '../index.js';

import defs from '../schemas/defs.schema.json' assert { type: 'json' };
import schema from '../schemas/features.schema.json' assert { type: 'json' };

let status: 0 | 1 = 0;

function checkDefsConsistency(): void {
    const defsPath: string = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "../schemas/defs.schema.json");
    const defsOnDisk: string = fs.readFileSync(defsPath, { encoding: "utf-8"});
    const defsGenerated: string = child_process.execSync("npm run --silent schema-defs", { encoding: "utf-8"}).trim();

    if (defsOnDisk !== defsGenerated) {
        console.error("There's a mismatch between the schema defs on disk and types in `index.ts`.");
        console.error("This may produce misleading results for feature validation.");
        console.error("To fix this, run `npm run schema-defs:write`.");
        status = 1;
    }
}

function validate() {
    const ajv = new Ajv({allErrors: true, schemas: [defs]});
    addFormats(ajv);

    const validate = ajv.compile(schema);

    const valid = validate(data);
    if (!valid) {
        for (const error of validate.errors) {
            console.error(`${error.instancePath}: ${error.message}`);
        }
        status = 1;
    }
}

checkDefsConsistency();
validate();
process.exit(status);
