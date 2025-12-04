import assert from "node:assert/strict";
import {
  assertFreshRegressionNotes,
  assertValidFeatureReference,
} from "./assertions";
import { FeatureData } from "./types";

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

describe("assertFreshRegressionNotes", function () {
  it("throws when the current status is the same as the previous status", function () {
    const f = {
      kind: "feature",
      status: { baseline: "low" },
      notes: [
        {
          category: "baseline-regression",
          old_baseline_value: "low",
        },
      ],
    } as Partial<FeatureData> as FeatureData;
    assert.throws(() => {
      assertFreshRegressionNotes("a", f);
    });
  });

  it("throws when the current status is better than the previous status", function () {
    const highLow = {
      kind: "feature",
      status: { baseline: "high" },
      notes: [
        {
          category: "baseline-regression",
          old_baseline_value: "low",
        },
      ],
    } as Partial<FeatureData> as FeatureData;
    assert.throws(() => {
      assertFreshRegressionNotes("a", highLow);
    });

    const lowFalse = {
      kind: "feature",
      status: { baseline: "low" },
      notes: [
        {
          category: "baseline-regression",
          old_baseline_value: false,
        },
      ],
    } as Partial<FeatureData> as FeatureData;
    assert.throws(() => {
      assertFreshRegressionNotes("a", lowFalse);
    });

    const highFalse = {
      kind: "feature",
      status: { baseline: "high" },
      notes: [
        {
          category: "baseline-regression",
          old_baseline_value: false,
        },
      ],
    } as Partial<FeatureData> as FeatureData;
    assert.throws(() => {
      assertFreshRegressionNotes("a", highFalse);
    });
  });

  it("does not throw when the current status is lower than the previous status", function () {
    const lowHigh = {
      kind: "feature",
      status: { baseline: "low" },
      notes: [
        {
          category: "baseline-regression",
          old_baseline_value: "high",
        },
      ],
    } as Partial<FeatureData> as FeatureData;
    assertFreshRegressionNotes("a", lowHigh);

    const falseLow = {
      kind: "feature",
      status: { baseline: false },
      notes: [
        {
          category: "baseline-regression",
          old_baseline_value: "low",
        },
      ],
    } as Partial<FeatureData> as FeatureData;
    assertFreshRegressionNotes("a", falseLow);

    const falseHigh = {
      kind: "feature",
      status: { baseline: false },
      notes: [
        {
          category: "baseline-regression",
          old_baseline_value: "high",
        },
      ],
    } as Partial<FeatureData> as FeatureData;
    assertFreshRegressionNotes("a", falseHigh);
  });

  it("does not throw without a regression note", function () {
    const noRegressionNotes = {
      kind: "feature",
      status: { baseline: "high" },
    } as Partial<FeatureData> as FeatureData;
    assertFreshRegressionNotes("a", noRegressionNotes);
  });
});
