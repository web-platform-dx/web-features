import assert from "node:assert/strict";

import { BrowserStatement, Identifier } from "@mdn/browser-compat-data";
import { Compat } from "./compat.js";
import { query } from "./query.js";

describe("query", function () {
  it("returns arbitrary BCD data (browsers)", function () {
    const data = new Compat().data;
    assert.ok(
      Object.hasOwn(
        query("browsers.chrome", data) as BrowserStatement,
        "releases",
      ),
    );
  });

  it("returns arbitrary BCD data (support)", function () {
    const data = new Compat().data;
    assert.ok(
      Object.hasOwn(
        query("css.properties.border-color", data) as Identifier,
        "__compat",
      ),
    );
  });

  it("throws for invalid path", function () {
    const data = new Compat().data;
    assert.throws(() => query("nonExistentNameSpace", data), Error);
    assert.throws(() => query("api.NonExistentFeature", data), Error);
    assert.throws(
      () => query("api.NonExistentFeature.subFeature", data),
      Error,
    );
  });

  it("should return the expected point in the tree (namespace)", function () {
    const data = new Compat().data;
    const obj = query("css", data) as Identifier;

    assert.ok(!("__compat" in obj));
    assert.ok("properties" in obj);
    assert.ok("at-rules" in obj);
  });

  it("should return the expected point in the tree (feature)", function () {
    const data = new Compat().data;
    const obj = query("api.HTMLAnchorElement.href", data) as Identifier;

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
    const data = new Compat().data;
    const obj = query("api.HTMLAnchorElement", data) as Identifier;

    assert.ok("__compat" in obj);
    assert.ok("charset" in obj);
    assert.ok("href" in obj);
  });
});
