import assert from "node:assert/strict";

import { Temporal } from "@js-temporal/polyfill";
import { toHighDate } from "./date-utils.js";

const toDateString = (d: Temporal.PlainDate) => d.toString().slice(0, 10);

describe("toHighDate", function () {
  it("Jan 1", function () {
    assert.equal(toDateString(toHighDate("2020-01-01")), "2022-07-01");
  });
  it("Feb 28", function () {
    assert.equal(toDateString(toHighDate("2020-02-28")), "2022-08-28");
  });
  // Last date for a feature to become Baseline high in YYYY+2 instead of +3.
  it("Jun 30", function () {
    assert.equal(toDateString(toHighDate("2020-06-30")), "2022-12-30");
  });
  it("Dec 31", function () {
    assert.equal(toDateString(toHighDate("2020-12-31")), "2023-06-30");
  });
});
