import assert from "node:assert/strict";
import {
  assertAllowedOverlap,
  assertCompatSetConsistency,
  assertValidFeatureReference,
} from "./assertions.ts";
import type { ParsedAuthoredData } from "./parse.ts";
import type { Status } from "./types.ts";

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

describe("assertCompatSetConsistency()", function () {
  it("throws when core keys have worse status than headline", function () {
    assert.throws(() => {
      assertCompatSetConsistency(
        "foo",
        {
          baseline: "high",
          by_compat_key: { example: { baseline: "low" } },
        } as unknown as Status,
        {
          compatFeatures: { core: ["example"], modifier: [], spare: [] },
        } as unknown as ParsedAuthoredData,
      );
    });
  });

  it("throws when core keys have worse date than headline", function () {
    assert.throws(() => {
      assertCompatSetConsistency(
        "foo",
        {
          baseline: "high",
          baseline_low_date: "2025-05-04",
          by_compat_key: {
            example: { baseline: "high", baseline_low_date: "2026-12-31" },
          },
        } as unknown as Status,
        {
          compatFeatures: { core: ["example"], modifier: [], spare: [] },
        } as unknown as ParsedAuthoredData,
      );
    });
  });

  it("does not throw when core keys have same status or date as headline", function () {
    assertCompatSetConsistency(
      "foo",
      {
        baseline: "high",
        baseline_low_date: "2026-01-01",
        by_compat_key: {
          example: { baseline: "high", baseline_low_date: "2026-01-01" },
        },
      } as unknown as Status,
      {
        compatFeatures: { core: ["example"], modifier: [], spare: [] },
      } as unknown as ParsedAuthoredData,
    );
  });

  it("does not throw when core keys have better status or date as headline", function () {
    assertCompatSetConsistency(
      "foo",
      {
        baseline: "low",
        baseline_low_date: "2025-01-01",
        by_compat_key: {
          example: { baseline: "high", baseline_low_date: "2025-01-01" },
        },
      } as unknown as Status,
      {
        compatFeatures: { core: ["example"], modifier: [], spare: [] },
      } as unknown as ParsedAuthoredData,
    );

    assertCompatSetConsistency(
      "foo",
      {
        baseline: "low",
        baseline_low_date: "2026-12-31",
        by_compat_key: {
          example: { baseline: "low", baseline_low_date: "2025-01-01" },
        },
      } as unknown as Status,
      {
        compatFeatures: { core: ["example"], modifier: [], spare: [] },
      } as unknown as ParsedAuthoredData,
    );
  });

  it("throws when modifier keys have worse status than headline", function () {
    assert.throws(() => {
      assertCompatSetConsistency(
        "foo",
        {
          baseline: "high",
          by_compat_key: { example: { baseline: "low" } },
        } as unknown as Status,
        {
          compatFeatures: { core: [], modifier: ["example"], spare: [] },
        } as unknown as ParsedAuthoredData,
      );
    });
  });

  it("does not throw when modifier keys have same status as headline", function () {
    assertCompatSetConsistency(
      "foo",
      {
        baseline: "low",
        by_compat_key: { example: { baseline: "low" } },
      } as unknown as Status,
      {
        compatFeatures: { core: [], modifier: ["example"], spare: [] },
      } as unknown as ParsedAuthoredData,
    );
  });
});
