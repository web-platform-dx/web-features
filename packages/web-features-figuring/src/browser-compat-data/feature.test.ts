import assert from "node:assert/strict";

import { feature } from "./feature";
import { browser } from ".";

describe("features", function () {
  describe("feature()", function () {
    it("queries BCD without data supplied", function () {
      const f = feature("css.properties.border-color");
      assert.equal(f.id, "css.properties.border-color");
    });
  });

  describe("Feature", function () {
    describe("#supportedBy()", function () {
      it("returns a bunch of releases corresponding to the support statement", function () {
        const f = feature("javascript.builtins.Array.sort");
        const releases = f.supportedBy().length;
        assert(releases >= 947);
      });
      it("returns releases only for `only` browsers", function () {
        const f = feature("javascript.builtins.Array.sort");
        const releases = f.supportedBy({ only: [browser("chrome")] }).length;
        const expectedReleases = browser("chrome").releases.length;
        assert.equal(releases, expectedReleases);
      });
    });
  });
});
