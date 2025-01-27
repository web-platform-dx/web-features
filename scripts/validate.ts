import Ajv from "ajv";
import assert from "node:assert/strict";

import * as schema from "../schemas/data.schema.json" with { type: "json" };

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
// TODO: turn on strictNullChecks, fix all the errors, and replace this with:
// const validator = ajv.compile<WebFeaturesData>(schema);
const validator = ajv.compile(schema);

assert.equal(
  validator({}),
  false,
  "Failed confidence check: schema validates empty object",
);

export { validator as validate };
