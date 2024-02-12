import assert from "node:assert/strict";

import { browser } from "./browser";
import { Release } from "./release";

describe("Release", function () {
  describe("toString()", function () {
    it("returns something useful", function () {
      const latestNonPreview = browser("chrome").releases().at(-2) as Release;
      assert(
        latestNonPreview.toString().startsWith("[Chrome 1"),
        latestNonPreview.toString(),
      );
    });
  });

  describe("date()", function () {
    it("get the date as a date object", function () {
      const release = browser("chrome")
        .releases()
        .find((r) => r.version === "100") as Release;
      console.log(release);
      assert.equal(release.date().getTime(), new Date("2022-03-29").getTime());
    });
  });

  describe("compare()", function () {
    it("returns 0 for equivalent releases", function () {
      const chrome100 = browser("chrome").version("100");
      assert.equal(chrome100.compare(chrome100), 0);
    });

    it("returns -1 when other release is later", function () {
      const chrome100 = browser("chrome").version("100");
      const chrome101 = browser("chrome").version("101");
      assert.equal(chrome100.compare(chrome101), -1);
    });

    it("returns 1 when other release is earlier", function () {
      const chrome100 = browser("chrome").version("100");
      const chrome101 = browser("chrome").version("101");
      assert.equal(chrome101.compare(chrome100), 1);
    });

    it("handles non-lexically sorted cases", function () {
      const fx15 = browser("firefox").version("1.5");
      const fx121 = browser("firefox").version("121");
      assert.equal(fx121.compare(fx15), 1);
      assert.equal(fx15.compare(fx121), -1);
    });
  });

  describe("#isPrerelease()", function () {
    it("returns false for the current release", function () {
      const chromeCurrent = browser("chrome").current();
      assert.equal(chromeCurrent.isPrerelease(), false);
    });
    it("returns false for a previous release", function () {
      const chrome100 = browser("chrome").version("100");
      assert.equal(chrome100.isPrerelease(), false);
    });
    it("returns true for the next release", function () {
      const chrome = browser("chrome");
      const chromeCurrent = chrome.current();
      const chromeNext = chrome
        .releases()
        .at(chrome.releases().indexOf(chromeCurrent) + 1) as Release;
      console.log(chromeNext);
      assert.equal(chromeNext.isPrerelease(), true);
    });
    it("returns true for the preview release", function () {
      const safariPreview = browser("safari").version("preview");
      console.log(safariPreview);
      assert.equal(safariPreview.isPrerelease(), true);
    });
  });
});
