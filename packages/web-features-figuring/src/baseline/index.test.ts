import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { computeBaseline } from ".";
import { Compat } from "../browser-compat-data/compat";

describe("computeBaseline", function () {
  it("returns a result for a feature", function () {
    const result = computeBaseline({
      compatKeys: ["css.properties.border-color"],
      checkAncestors: false,
    });
    assert.equal(result.baseline, "high");
  });

  it("returns a result for a feature (data provided)", function () {
    const compat = new Compat(
      JSON.parse(
        readFileSync(new URL("scrubbed.test.json", import.meta.url), {
          encoding: "utf-8",
        }),
      ),
    );

    const result = computeBaseline(
      {
        compatKeys: ["css.properties.border-color"],
        checkAncestors: false,
      },
      compat,
    );
    assert.equal(result.baseline, "high");
  });
});
