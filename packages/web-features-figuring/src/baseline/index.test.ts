import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import bcd from "@mdn/browser-compat-data";
import * as chai from "chai";
import chaiJestSnapshot from "chai-jest-snapshot";

import { computeBaseline } from ".";
import { Compat } from "../browser-compat-data/compat";

chai.use(chaiJestSnapshot);

describe("computeBaseline", function () {
  before(function () {
    chaiJestSnapshot.resetSnapshotRegistry();
  });

  beforeEach(function () {
    chaiJestSnapshot.configureUsingMochaContext(this);
  });

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
        readFileSync(new URL("index.test.ts.bcd.json", import.meta.url), {
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

  it("tests via a BCD snapshot", function () {
    // If we thin out the data first, the snapshot assertion can run much faster
    const data = {
      __meta: bcd.__meta,
      browsers: bcd.browsers,
      css: bcd.css,
    };
    chai.expect(data).to.matchSnapshot();

    const result = computeBaseline(
      {
        compatKeys: ["css.properties.border-color"],
        checkAncestors: false,
      },
      new Compat(data),
    );
    assert.equal(result.baseline, "high");
  });
});
