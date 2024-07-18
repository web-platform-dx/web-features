import assert from "node:assert/strict";

import { Temporal } from "@js-temporal/polyfill";
import * as chai from "chai";
import chaiJestSnapshot from "chai-jest-snapshot";

import { browser } from "../browser-compat-data/index.js";
import { computeBaseline, getStatus, keystoneDateToStatus } from "./index.js";

chai.use(chaiJestSnapshot);

describe("getStatus", function () {
  before(function () {
    chaiJestSnapshot.resetSnapshotRegistry();
  });

  beforeEach(function () {
    chaiJestSnapshot.configureUsingMochaContext(this);
  });

  it("returns a status", function () {
    const result = getStatus("fetch", "api.Response.json");
    assert.equal(result.baseline, "high");
    chai.expect(result).to.matchSnapshot();
  });
});

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

  it("finds discrepancies with ancestors (checkAncestors)", function () {
    const result = computeBaseline({
      compatKeys: ["api.Notification.body"],
      checkAncestors: false,
    });
    const resultExplicit = computeBaseline({
      compatKeys: ["api.Notification", "api.Notification.body"],
      checkAncestors: false,
    });
    const resultWithAncestors = computeBaseline({
      compatKeys: ["api.Notification.body"],
      checkAncestors: true,
    });

    assert.equal(resultExplicit.toJSON(), resultWithAncestors.toJSON());
    assert.notEqual(result.toJSON(), resultWithAncestors.toJSON());

    assert.notEqual(result.baseline, resultWithAncestors.baseline);
    assert.notEqual(
      result.baseline_low_date?.toString(),
      resultWithAncestors.baseline_low_date?.toString(),
    );

    chai.expect(result).to.matchSnapshot();
    chai.expect(resultExplicit).to.matchSnapshot();
    chai.expect(resultWithAncestors).to.matchSnapshot();
  });

  it("surfaces version ranges from the underlying compat data", function () {
    const singleKey = computeBaseline({
      compatKeys: ["css.properties.align-self"],
    });
    const singleKeySafari = singleKey.support.get(browser("safari"));
    assert(singleKeySafari);
    assert.equal(singleKeySafari.release.version, "9");
    assert.equal(singleKeySafari.text, "9");
    assert.equal(JSON.parse(singleKey.toJSON()).support.safari, "9");

    const multiKey = computeBaseline({
      compatKeys: [
        "css.properties.align-self",
        "css.properties.align-self.flex_context.baseline",
      ],
      checkAncestors: false,
    });
    const multiKeySafari = multiKey.support.get(browser("safari"));
    assert(multiKeySafari);
    assert.equal(multiKeySafari.release.version, "9");
    assert.equal(multiKeySafari.text, "9");
    assert.equal(JSON.parse(multiKey.toJSON()).support.safari, "9");
  });

  it("calculates ranged dates from underlying compat data ranged versions", function () {
    const result = computeBaseline({
      compatKeys: ["api.FileSystem"],
    });
    assert.equal(JSON.parse(result.toJSON()).support.edge, "≤18");
    assert(JSON.parse(result.toJSON()).baseline_low_date.startsWith("≤"));
  });

  it("disregards support that's been removed", function () {
    const result = computeBaseline({
      compatKeys: ["api.AudioTrack"],
      checkAncestors: false,
    });
    chai.expect(result).to.matchSnapshot();
    assert.notEqual(Boolean(result.baseline), true);
  });

  it("rejects deprecated", function () {
    const actual = computeBaseline({
      compatKeys: ["javascript.statements.with"],
      checkAncestors: false,
    });
    assert.equal(actual.baseline, false);
  });
});

describe("keystoneDateToStatus()", function () {
  it('returns "low" for date 1 year before cutoff date', function () {
    const status = keystoneDateToStatus(
      "2020-01-01",
      Temporal.PlainDate.from("2021-01-01"),
      false,
    );
    assert.equal(status.baseline, "low");
    assert.equal(status.baseline_low_date, "2020-01-01");
    assert.equal(status.baseline_high_date, null);
  });

  it('returns "high" for date 3 years before cutoff date', function () {
    const status = keystoneDateToStatus(
      "2020-01-01",
      Temporal.PlainDate.from("2024-01-01"),
      false,
    );
    assert.equal(status.baseline, "high");
    assert.equal(status.baseline_low_date, "2020-01-01");
    assert.equal(status.baseline_high_date, "2022-07-01");
  });

  it("returns false for null dates", function () {
    const status = keystoneDateToStatus(
      null,
      Temporal.PlainDate.from("2020-01-01"),
      false,
    );
    assert.equal(status.baseline, false);
    assert.equal(status.baseline_low_date, null);
    assert.equal(status.baseline_high_date, null);
  });

  it("returns false for discouraged (deprecated, obsolete, etc.) features", function () {
    const status = keystoneDateToStatus(
      "2020-01-01",
      Temporal.PlainDate.from("2020-01-01"),
      true,
    );
    assert.equal(status.baseline, false);
    assert.equal(status.baseline_low_date, null);
    assert.equal(status.baseline_high_date, null);
  });

  it("preserves ranges where they exist", function () {
    const status = keystoneDateToStatus(
      "≤2020-01-01",
      Temporal.PlainDate.from("2024-01-01"),
      false,
    );
    assert.equal(status.baseline, "high");
    assert.equal(status.baseline_low_date, "≤2020-01-01");
    assert.equal(status.baseline_high_date, "≤2022-07-01");
  });
});
