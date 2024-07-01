import assert from "node:assert/strict";

import { feature } from "./feature.js";
import { browser } from "./index.js";

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

    describe("standard_track", function () {
      it("returns true only when true", function () {
        const noStatus = feature("webextensions.manifest.storage");
        assert.equal(noStatus.standard_track, false);

        const nonStandard = feature("css.properties.-webkit-text-zoom");
        assert.equal(nonStandard.standard_track, false);

        const standard = feature("html.elements.table");
        assert.equal(standard.standard_track, true);
      });
    });

    describe("spec_url", function () {
      it("returns an empty array if there's no spec_url", function () {
        const noSpec = feature("javascript.builtins.Date.parse.iso_8601");
        assert(noSpec.spec_url.length === 0);
      });

      it("returns an array regardless of the number of spec_urls", function () {
        const oneSpec = feature("css.properties.grid").spec_url;
        assert.equal(oneSpec.length, 1);

        const twoSpecs = feature("css.properties.width").spec_url;
        assert.equal(twoSpecs.length, 2);
      });
    });

    describe("tags", function () {
      it("returns an array for features with tags", function () {
        const f = feature("css.types.length.cap");
        assert(Array.isArray(f.data.__compat?.tags));
        assert(Array.isArray(f.tags));
        assert(f.tags.length > 0);
      });

      it("returns an array for features without tags", function () {
        const f = feature("webextensions.manifest.author");
        assert.equal(f.data.__compat?.tags, undefined);
        assert(Array.isArray(f.tags));
        assert(f.tags.length === 0);
      });
    });
  });
});
