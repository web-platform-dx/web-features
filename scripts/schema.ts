import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import features from '../index.js';

import schema from '../schemas/features.schema.json' assert { type: 'json' };
import defs from '../schemas/defs.schema.json' assert { type: 'json' }

async function validate() {
    const ajv = new Ajv({allErrors: true, allowUnionTypes: true, schemas: [defs]});
    addFormats(ajv);

    const validate = ajv.compile(schema);

    const valid = validate(features);
    if (!valid) {
        for (const error of validate.errors) {
            console.error(`${error.instancePath}: ${error.message}`);
        }
        process.exit(1);
    }
}

validate();
