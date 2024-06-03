import assert from "node:assert/strict";

import { Temporal } from "@js-temporal/polyfill";

import { browser } from "./browser.js";
import { Release } from "./release.js";

describe("Release", function () {
  describe("toString()", function () {
    it("returns something useful", function () {
      const latestNonPreview = browser("chrome").releases.at(-2) as Release;
      assert(
        latestNonPreview.toString().startsWith("[Chrome 1"),
        latestNonPreview.toString(),
      );
    });
  });

  describe("date (getter)", function () {
    it("get the date as a Temporal PlainDate", function () {
      const release = browser("chrome").releases.find(
        (r) => r.version === "100",
      ) as Release;
      assert(release.date !== null);
      assert.equal(
        Temporal.PlainDate.compare(
          release.date,
          Temporal.PlainDate.from("2022-03-29"),
        ),
        0,
      );
    });
    it("get the date as null when the date is not set", function () {
      const release = [...browser("chrome").releases]
        .reverse()
        .find((r) => r.data.release_date === undefined);
      assert(release, "No release without a release date found in BCD");
      assert.equal(release.date, null);
    });
  });

  describe("compare()", function () {
    it("returns 0 for equivalent releases", function () {
      const chrome100 = browser("chrome").version("100");
      assert.equal(chrome100.compare(chrome100), 0);
    });

    it("returns less than zero when other release is later", function () {
      const chrome100 = browser("chrome").version("100");
      const chrome101 = browser("chrome").version("101");
      assert(chrome100.compare(chrome101) < 0);
    });

    it("returns greater than 0 when other release is earlier", function () {
      const chrome100 = browser("chrome").version("100");
      const chrome101 = browser("chrome").version("101");
      assert(chrome101.compare(chrome100) > 0);
    });

    it("handles non-lexically sorted cases", function () {
      const fx15 = browser("firefox").version("1.5");
      const fx121 = browser("firefox").version("121");
      assert(fx121.compare(fx15) > 0);
      assert(fx15.compare(fx121) < 0);
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
      const chromeNext = chrome.releases.at(
        chrome.releases.indexOf(chromeCurrent) + 1,
      ) as Release;
      assert.equal(chromeNext.isPrerelease(), true);
    });
    it("returns true for the preview release", function () {
      const safariPreview = browser("safari").version("preview");
      assert.equal(safariPreview.isPrerelease(), true);
    });
  });
});
