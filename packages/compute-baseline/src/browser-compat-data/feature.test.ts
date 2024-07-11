import assert from "node:assert/strict";

import { feature } from "./feature.js";
import { browser, Compat } from "./index.js";

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

    describe("flatSupportedIn()", function () {
      it("returns true for unqualified support", function () {
        const cr = browser("chrome");
        assert.equal(feature("api.Attr").supportedIn(cr.version("100")), true);
      });

      it("returns false for qualified support", function () {
        const cr = browser("chrome");
        assert.equal(
          feature("css.properties.line-clamp").supportedIn(cr.version("100")),
          false,
        ); // { version_added: "…", "prefix": "-webkit-" }
      });

      it("returns false for wholly unsupported", function () {
        const fx = browser("firefox");
        assert.equal(
          feature("api.Accelerometer").supportedIn(fx.current()),
          false,
        ); // { version_added: false }
      });

      it("returns null for unknown support", function () {
        const edge = browser("edge");
        const f = feature("svg.elements.animate"); // { version_added: "≤79" }

        assert.equal(f.supportedIn(edge.version("12")), null);
        assert.equal(f.supportedIn(edge.version("79")), true);
        assert.equal(f.supportedIn(edge.version("80")), true);
      });
    });

    describe("supportedIn()", function () {
      it("returns support for features supported with and without qualification", function () {
        const compat = new Compat();
        const cr = browser("chrome");

        // { version_added: "…" }
        const bgColor = feature(
          "css.properties.background-color",
        ).supportedInDetails(cr.version("100"));
        assert.equal(bgColor.length, 1);
        assert.equal(bgColor[0]?.supported, true);

        // { version_added: "…", prefix: "-webkit-" }
        const lineClamp = feature(
          "css.properties.line-clamp",
        ).supportedInDetails(cr.version("100"));
        assert.equal(lineClamp.length, 1);
        assert.equal(lineClamp[0]?.supported, true);
        assert.equal(lineClamp[0]?.qualifications?.prefix, "-webkit-");
      });

      it("returns mixed results for (un)prefixed features", function () {
        const fx = browser("firefox");
        const actual = feature(
          "css.types.image.gradient.repeating-linear-gradient",
        ).supportedInDetails(fx.version("100"));
        assert.equal(actual.length, 3); // unprefixed, -moz-, and -webkit-
        assert(actual.some((s) => s.supported && "qualifications" in s));
        assert(actual.some((s) => s.supported && !("qualifications" in s)));
      });

      it("returns unknown support before version ranges", function () {
        const edge = browser("edge");
        const f = feature("svg.elements.animate");
        const unknown = f.supportedInDetails(edge.version("12"));
        assert.equal(unknown.length, 1);
        assert.equal(unknown[0]?.supported, null);

        const known = f.supportedInDetails(edge.version("79"));
        assert.equal(known.length, 1);
        assert.equal(known[0]?.supported, true);
      });
    });
  });
});
