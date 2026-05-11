import assert from "node:assert/strict";
import { makeCompatSets, parseAuthoring } from "./parse";

describe("makeCompatSets", function () {
  it("from explicit compat sets", function () {
    const set = makeCompatSets({
      core: ["html.elements.a"],
      modifier: ["api.HTMLAnchorElement"],
      spare: ["html.elements.a.href.href_sms"],
    });
    assert.deepEqual(set.core, ["html.elements.a"]);
    assert.deepEqual(set.modifier, ["api.HTMLAnchorElement"]);
    assert.deepEqual(set.spare, ["html.elements.a.href.href_sms"]);
  });

  it("from compute_from and flat compat_features", function () {
    const set = makeCompatSets(
      [
        "api.HTMLAnchorElement",
        "html.elements.a",
        "html.elements.a.href.href_sms",
      ],
      ["html.elements.a"],
    );
    assert.deepEqual(set.core, ["html.elements.a"]);
    assert.deepEqual(set.modifier, []);
    assert.deepEqual(set.spare, [
      "api.HTMLAnchorElement",
      "html.elements.a.href.href_sms",
    ]);
  });

  it("from compute_from and implicit keys", function () {
    const set = makeCompatSets("a", ["html.elements.a"]);
    assert.deepEqual(set.core, ["html.elements.a"]);
    assert(set.spare.includes("api.HTMLAnchorElement"));
  });

  it("from flat compat_features", function () {
    const set = makeCompatSets([
      "api.HTMLAnchorElement",
      "html.elements.a",
      "html.elements.a.href.href_sms",
    ]);
    assert.deepEqual(set.core, [
      "api.HTMLAnchorElement",
      "html.elements.a",
      "html.elements.a.href.href_sms",
    ]);
  });

  it("from implicit keys", function () {
    const set = makeCompatSets("a");
    assert(set.core.includes("html.elements.a"));
  });

  it("from implicit keys, keylessly", function () {
    const set = makeCompatSets("http3");
    assert.equal(set.core.length, 0);
    assert.equal(set.modifier.length, 0);
    assert.equal(set.spare.length, 0);
  });

  it("keylessly", function () {
    const set = makeCompatSets();
    assert.deepEqual(set.core, []);
    assert.deepEqual(set.modifier, []);
    assert.deepEqual(set.spare, []);
  });

  it("throws if compute_from is not a strict subset of a feature's keys", function () {
    assert.throws(() => {
      makeCompatSets(["a", "b", "c"], ["d"]);
    });
  });
});

describe("parseAuthoring", function () {
  it("throws with non-object inputs", function () {
    assert.throws(
      () => parseAuthoring("foo", null),
      Error,
      "expected throw for authored null",
    );
    assert.throws(
      () => parseAuthoring("bar", undefined),
      Error,
      "expected throw for authored undefined",
    );
    assert.throws(
      () => parseAuthoring("baz", 123),
      Error,
      "expected throw for authored number",
    );
    assert.throws(
      () => parseAuthoring("quux", "somestring"),
      Error,
      "expected throw for authored string",
    );
  });
});
