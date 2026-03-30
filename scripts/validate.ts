import Ajv from "ajv";
import assert from "node:assert/strict";

import * as schema from "../schemas/data.schema.json" with { type: "json" };
import * as proposedSchema from "../schemas/data.proposed.schema.json" with { type: "json" };

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
// TODO: turn on strictNullChecks, fix all the errors, and replace this with:
// const validator = ajv.compile<WebFeaturesData>(schema);
const validator = ajv.compile(schema);

assert.equal(
  validator({}),
  false,
  "Failed confidence check: schema validates empty object",
);

const proposedValidator = ajv.compile(proposedSchema);

assert.equal(
  proposedValidator({}),
  false,
  "Failed confidence check: schema validates empty object",
);

assert.equal(
  proposedValidator({ features: {} }),
  true,
  "Failed confidence check: schema rejects empty features object",
);

export { validator as validate, proposedValidator as validateProposed };
