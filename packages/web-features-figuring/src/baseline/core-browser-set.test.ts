import assert from "node:assert/strict";
import { isBaselineHighRelease } from "./core-browser-set";
import { Compat } from "../browser-compat-data";
import { Temporal } from "@js-temporal/polyfill";

describe("isBaselineHighRelease", function () {
  it("returns false for undated releases", function () {
    // Get an upcoming, undated Chrome
    const r = new Compat()
      .browser("chrome")
      .releases.find((r) => r.date === null);
    assert.equal(r?.date, null);
    assert.equal(isBaselineHighRelease(r), false);
  });

  it("returns false for future releases", function () {
    // Get an upcoming, non-current Firefox
    const r = new Compat()
      .browser("firefox")
      .releases.find(
        (r) => r.date !== null && ["planned"].includes(r.data.status),
      );
    assert(
      r,
      "If you're seeing this message it means that BCD doesn't know about a future-dated Firefox release",
    );
    assert(r.date);

    assert(
      Temporal.PlainDate.compare(Temporal.Now.plainDateISO(), r.date) <= 0,
      `${r}'s release date is ${Temporal.Now.plainDateISO().until(r.date).days} days from today`,
    );
    assert.equal(
      isBaselineHighRelease(r),
      false,
      `${r} is Baseline "high", even though it's in the future!`,
    );
  });

  it("returns true for a current release", function () {
    const r = new Compat().browser("firefox").current();
    assert(isBaselineHighRelease(r));
  });

  it("returns true for a release 29 months ago", function () {
    const monthsAgo = Temporal.Now.plainDateISO().subtract({ months: 29 });
    const r = [...new Compat().browser("firefox").releases]
      .reverse()
      .find(
        (r) =>
          r.date !== null &&
          Temporal.PlainDate.compare(r.date, monthsAgo) == -1,
      );
    assert(
      r?.date,
      "If you're seeing this message it means that BCD doesn't know about a future-dated Firefox release",
    );
    assert.equal(isBaselineHighRelease(r), true);
  });

  it("returns false for a release 32 months ago", function () {
    const monthsAgo = Temporal.Now.plainDateISO().subtract({ months: 32 });
    const r = [...new Compat().browser("firefox").releases]
      .reverse()
      .find(
        (r) =>
          r.date !== null &&
          Temporal.PlainDate.compare(r.date, monthsAgo) == -1,
      );
    assert(
      r?.date,
      "If you're seeing this message it means that BCD doesn't know about a future-dated Firefox release",
    );
    assert.equal(isBaselineHighRelease(r), false);
  });
});
