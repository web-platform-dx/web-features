import assert from "node:assert/strict";

import { query } from "./query";
import { BrowserStatement, Identifier } from "@mdn/browser-compat-data";

describe("query", function () {
  it("returns arbitrary BCD data (browsers)", function () {
    assert.ok(
      Object.hasOwn(query("browsers.chrome") as BrowserStatement, "releases"),
    );
  });

  it("returns arbitrary BCD data (support)", function () {
    assert.ok(
      Object.hasOwn(
        query("css.properties.border-color") as Identifier,
        "__compat",
      ),
    );
  });

  it("throws for invalid path", function () {
    assert.throws(() => query("nonExistentNameSpace"), Error);
    assert.throws(() => query("api.NonExistentFeature"), Error);
    assert.throws(() => query("api.NonExistentFeature.subFeature"), Error);
  });

  it("should return the expected point in the tree (namespace)", function () {
    const obj = query("css") as Identifier;

    assert.ok(!("__compat" in obj));
    assert.ok("properties" in obj);
    assert.ok("at-rules" in obj);
  });

  it("should return the expected point in the tree (feature)", function () {
    const obj = query("api.HTMLAnchorElement.href") as Identifier;

    assert.ok("__compat" in obj);
    assert.ok(obj.__compat !== undefined);
    assert.ok("support" in obj.__compat);
    assert.ok("status" in obj.__compat);
    assert.equal(
      "https://developer.mozilla.org/docs/Web/API/HTMLAnchorElement/href",
      obj.__compat.mdn_url,
    );
  });

  it("should return the expected point in the tree (feature with children)", function () {
    const obj = query("api.HTMLAnchorElement") as Identifier;

    assert.ok("__compat" in obj);
    assert.ok("charset" in obj);
    assert.ok("href" in obj);
  });
});
