import assert from "node:assert/strict";

import { isFuture } from "./date-utils";
import { Temporal } from "@js-temporal/polyfill";

describe("isFuture", function () {
  it("returns true for tomorrow", function () {
    const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
    assert(isFuture(tomorrow));
  });

  it("returns false for yesterday", function () {
    const yesterday = Temporal.Now.plainDateISO().subtract({ days: 1 });
    assert(isFuture(yesterday) === false);
  });

  it("returns false for today", function () {
    const now = Temporal.Now.plainDateISO();
    assert(isFuture(now) === false);
  });
});
