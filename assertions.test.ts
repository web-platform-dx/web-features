import assert from "node:assert/strict";
import { assertValidFeatureReference } from "./assertions";

describe("assertValidReference()", function () {
  it("throws if target ID is a move", function () {
    assert.throws(() => {
      assertValidFeatureReference("a", "some-moving-feature", {
        "some-moving-feature": { kind: "moved" },
      });
    });
  });

  it("throws if target ID is a split", function () {
    assert.throws(() => {
      assertValidFeatureReference("a", "some-split-feature", {
        "some-split-feature": { kind: "split" },
      });
    });
  });

  it("throws if target ID is not defined", function () {
    assert.throws(() => {
      assertValidFeatureReference(
        "a",
        "this-is-a-completely-invalid-feature",
        {},
      );
    });
  });

  it("does not throw if target ID is a feature", function () {
    assert.doesNotThrow(() => {
      assertValidFeatureReference("a", "dom", { dom: { kind: "feature" } });
    });
  });
});
