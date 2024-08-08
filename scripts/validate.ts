import Ajv from "ajv";
import addFormats from "ajv-formats";
import assert from "node:assert/strict";

import * as schema from "../schemas/data.schema.json" with { type: "json" };

export function validate(data: any) {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  // TODO: turn on strictNullChecks, fix all the errors, and replace this with:
  // const validator = ajv.compile<WebFeaturesData>(schema);
  const validator = ajv.compile(schema);

  assert.equal(
    validator({}),
    false,
    "Failed confidence check: schema validates empty object",
  );

  return validator;
}
