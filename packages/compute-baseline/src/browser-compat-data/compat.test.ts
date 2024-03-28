import assert from "node:assert/strict";

import { Compat } from "./compat";

describe("Compat()", function () {
  describe("constructor", function () {
    it("constructs with any data", function () {
      const c1 = new Compat({});
      assert.deepEqual(c1.data, {});
    });
  });

  describe("query()", function () {
    it("returns a subtree", function () {
      const c = new Compat();
      const result = c.query("css.properties.display");
      assert(typeof result === "object" && result !== null);
      const keys = Object.keys(result);
      assert(keys.includes("__compat"), `'__compat' in ${keys}`);
      assert(keys.includes("flex"), `'flex' in ${keys}`);
    });
  });

  describe("browser()", function () {
    it("returns a Browser for valid keys", function () {
      const c = new Compat();
      const b = c.browser("chrome");
      assert.equal(b.id, "chrome");
      assert.equal(b.name, "Chrome");
    });

    it("returns the same Browser when called again", function () {
      const c = new Compat();
      const b1 = c.browser("chrome");
      const b2 = c.browser("chrome");
      assert.strictEqual(b1, b2);
    });
  });

  describe("feature()", function () {
    it("returns a Feature for a valid key", function () {
      const c = new Compat();
      const f = c.feature("css.properties.display");
      assert(f.mdn_url);
      assert(f.id);
    });
  });
});
