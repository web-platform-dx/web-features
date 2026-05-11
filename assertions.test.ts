import assert from "node:assert/strict";
import {
  assertAllowedOverlap,
  assertValidFeatureReference,
} from "./assertions";

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

describe("assertAllowedOverlap()", function () {
  it("does not throw when a key does not overlap", function () {
    assert.doesNotThrow(() => {
      const keysToIDs = new Map([["api.HTMLMediaElement", ["audio"]]]);
      assertAllowedOverlap(
        `api.HTMLMediaElement`,
        `audio`,
        keysToIDs,
        new Map(),
      );
    });
  });

  it("does not throw when a key is allowlisted with another feature", function () {
    assert.doesNotThrow(() => {
      const keysToIDs = new Map([["api.HTMLMediaElement", ["audio", "video"]]]);
      assertAllowedOverlap(
        "api.HTMLMediaElement",
        "audio",
        keysToIDs,
        new Map([["api.HTMLMediaElement", ["audio", "video"]]]),
      );
    });
  });

  it("throws when a key is not allowlisted and overlaps", function () {
    assert.throws(() => {
      const keysToIDs = new Map([["api.HTMLMediaElement", ["audio", "video"]]]);
      assertAllowedOverlap(
        "api.HTMLMediaElement",
        "audio",
        keysToIDs,
        new Map(),
      );
    });
  });

  it("throws when a key is allowlisted but overlaps with an unnamed feature", function () {
    assert.throws(() => {
      const keysToIDs = new Map([
        ["api.HTMLMediaElement", ["audio", "media-super-feature"]],
      ]);
      assertAllowedOverlap(
        "api.HTMLMediaElement",
        "video",
        keysToIDs,
        new Map([["api.HTMLMediaElement", ["audio", "media-super-feature"]]]),
      );
    });
  });
});
