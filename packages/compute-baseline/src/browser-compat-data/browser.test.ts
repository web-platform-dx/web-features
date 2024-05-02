import assert from "node:assert/strict";

import { browser } from "./browser.js";

describe("browser()", function () {
  it("throws for non-existent browsers", function () {
    assert.throws(() => browser("crumpet"), Error);
  });

  it("gives you comparably equal browser objects", function () {
    assert.equal(browser("chrome"), browser("chrome"));
  });

  describe("Browser", function () {
    describe("#toString()", function () {
      it("returns something useful", function () {
        assert.equal(`${browser("chrome")}`, "[Browser Chrome]");
      });
    });

    describe("#releases", function () {
      it("is an array of releases", function () {
        assert(browser("chrome").releases.length > 99);
        assert(browser("firefox").releases.length > 99);
      });
    });

    describe("#version()", function () {
      it("returns a release by version number string", function () {
        assert.equal(browser("chrome").version("99").version, "99");
      });

      it("throw for invalid version number", function () {
        assert.throws(() => browser("chrome").version("1.0"), Error);
      });
    });
  });
});
