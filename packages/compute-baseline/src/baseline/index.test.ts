import assert from "node:assert/strict";

import * as chai from "chai";
import chaiJestSnapshot from "chai-jest-snapshot";

import { computeBaseline, keystoneDateToStatus } from ".";
import { Temporal } from "@js-temporal/polyfill";

chai.use(chaiJestSnapshot);

describe("computeBaseline", function () {
  before(function () {
    chaiJestSnapshot.resetSnapshotRegistry();
  });

  beforeEach(function () {
    chaiJestSnapshot.configureUsingMochaContext(this);
  });

  it("returns something sensible for the most complex features", function () {
    // These are some of the most "complex" BCD features, given approximately by:
    // const complexity = JSON.stringify(data.__compat, undefined, 2).split("\n").length
    const result = Object.fromEntries(
      [
        "api.Document.visibilitychange_event",
        "css.types.basic-shape.path",
        "api.DOMMatrix.DOMMatrix",
      ].map((key) => [
        key,
        computeBaseline({ compatKeys: [key], checkAncestors: false }),
      ]),
    );
    assert.equal(
      result["api.Document.visibilitychange_event"]?.baseline,
      "high",
    );
    assert.equal(result["css.types.basic-shape.path"]?.baseline, false);
    assert.equal(result["api.DOMMatrix.DOMMatrix"]?.baseline, "high");
    chai.expect(result).to.matchSnapshot();
  });

  it("returns something sensible for the least complex features", function () {
    // These are some of the least "complex" BCD features
    const result = Object.fromEntries(
      [
        "css.properties.counter-reset.reset_does_not_affect_siblings",
        "html.global_attributes.exportparts",
        "html.elements.form.target",
      ].map((key) => [
        key,
        computeBaseline({ compatKeys: [key], checkAncestors: false }),
      ]),
    );

    assert.equal(
      result["css.properties.counter-reset.reset_does_not_affect_siblings"]
        ?.baseline,
      false,
    );
    assert.equal(
      result["html.global_attributes.exportparts"]?.baseline,
      "high",
    );
    assert.equal(result["html.elements.form.target"]?.baseline, "high");
    chai.expect(result).to.matchSnapshot();
  });

  it("returns a result for a feature", function () {
    const result = computeBaseline({
      compatKeys: ["css.properties.border-color"],
      checkAncestors: false,
    });
    assert.equal(result.baseline, "high");
    assert.equal(result.baseline_low_date, "2015-07-29"); // The first release of Edge, the youngest release in consideration
    assert.equal(result.baseline_high_date, "2018-01-29"); // 30 months later
  });
});

describe("keystoneDateToStatus()", function () {
  it('returns "low" for recent dates', function () {
    const status = keystoneDateToStatus(
      Temporal.Now.plainDateISO().subtract({ days: 7 }),
    );
    assert.equal(status.baseline, "low");
    assert.equal(typeof status.baseline_low_date, "string");
    assert.equal(status.baseline_high_date, null);
  });

  it('returns "high" for long past dates', function () {
    const status = keystoneDateToStatus(Temporal.PlainDate.from("2020-01-01"));
    assert.equal(status.baseline, "high");
    assert.equal(typeof status.baseline_low_date, "string");
    assert.equal(typeof status.baseline_high_date, "string");
  });

  it("returns false for future dates", function () {
    const status = keystoneDateToStatus(
      Temporal.Now.plainDateISO().add({ days: 90 }),
    );
    assert.equal(status.baseline, false);
    assert.equal(status.baseline_low_date, null);
    assert.equal(status.baseline_high_date, null);
  });

  it("returns false for null dates", function () {
    const status = keystoneDateToStatus(null);
    assert.equal(status.baseline, false);
    assert.equal(status.baseline_low_date, null);
    assert.equal(status.baseline_high_date, null);
  });
});
