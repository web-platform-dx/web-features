import assert from "node:assert/strict";
import {
  assertCompatSetConsistency,
  assertValidFeatureReference,
} from "./assertions";
import { ParsedAuthoredData } from "./parse";
import { Status } from "./types";

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
