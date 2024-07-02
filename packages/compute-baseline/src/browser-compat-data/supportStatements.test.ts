import assert from "node:assert/strict";

import { browser } from "./browser.js";
import {
  RealSupportStatement,
  SupportStatement,
  statement,
} from "./supportStatements.js";

describe("statements", function () {
  describe("statement()", function () {
    it("upgrades support statements", function () {
      const v1 = statement(new SupportStatement({ version_added: "1" }));
      assert(v1 instanceof RealSupportStatement);
    });

    it("passes through real support statements", function () {
      const original = new RealSupportStatement({ version_added: "2" });
      assert(original === statement(original));
    });

    it("accepts raw support statement objects", function () {
      const v3 = statement({ version_added: "3" });
      assert(v3 instanceof RealSupportStatement);
    });
  });

  describe("SupportStatement", function () {
    describe("#flags", function () {
      const s = {
        version_added: "1",
        version_removed: "2",
      };

      it("return empty array for no flags", function () {
        const st = new SupportStatement(s);
        assert.ok(st.flags.length === 0);
      });

      it("return array with flags", function () {
        const flag = {
          type: "preference" as const,
          name: "dom.streams.enabled",
          value_to_set: "true",
        };
        const st = new SupportStatement({ flags: [flag], ...s });
        assert.ok(st.flags.length === 1);
      });
    });

    describe("#partial_implementation", function () {
      it("returns value", function () {
        const s = new SupportStatement({
          version_added: "1",
          version_removed: "2",
          partial_implementation: true,
        });
        assert.equal(s.partial_implementation, true);
      });

      it("returns false for undefined", function () {
        const s = new SupportStatement({
          version_added: "1",
          version_removed: "2",
        });
        assert.equal(s.partial_implementation, false);
      });
    });

    describe("#version_added", function () {
      it("returns version", function () {
        const s = new SupportStatement({
          version_added: "1",
          version_removed: "2",
        });
        assert.equal(s.version_added, "1");
      });

      it("returns false for undefined", function () {
        const s = new SupportStatement({});
        assert.equal(s.version_added, false);
      });

      it("returns null for null", function () {
        const s = new SupportStatement({ version_added: null });
        assert.equal(s.version_added, null);
      });
    });

    describe("#version_removed", function () {
      it("returns version", function () {
        const s = new SupportStatement({
          version_added: "1",
          version_removed: "2",
        });
        assert.equal(s.version_removed, "2");
      });

      it("returns false for undefined", function () {
        const s = new SupportStatement({ version_added: "1" });
        assert.equal(s.version_removed, false);
      });
    });
  });

  describe("RealSupportStatement", function () {
    describe("#constructor", function () {
      it("throws for empty support statement", function () {
        assert.throws(() => new RealSupportStatement({}));
      });

      it("throws for missing version_added", function () {
        assert.throws(
          () => new RealSupportStatement({ version_removed: false }),
        );
      });

      it("throws for explicitly undefined version_added or version_removed", function () {
        assert.throws(
          () => new RealSupportStatement({ version_added: undefined }),
        );
        assert.throws(
          () =>
            new RealSupportStatement({
              version_added: "1",
              version_removed: undefined,
            }),
        );
      });

      it("throws for null version_added or version_removed", function () {
        assert.throws(() => new RealSupportStatement({ version_added: null }));
        assert.throws(
          () =>
            new RealSupportStatement({
              version_added: "1",
              version_removed: null,
            }),
        );
      });

      it("throws for true version_added or version_removed", function () {
        assert.throws(() => new RealSupportStatement({ version_added: true }));
        assert.throws(
          () =>
            new RealSupportStatement({
              version_added: "1",
              version_removed: true,
            }),
        );
      });

      it("does not throw for false version_added or version_removed", function () {
        assert.doesNotThrow(
          () => new RealSupportStatement({ version_added: false }),
        );
        assert.doesNotThrow(
          () =>
            new RealSupportStatement({
              version_added: "1",
              version_removed: false,
            }),
        );
      });
    });
    describe("#supportedBy", function () {
      it("returns an array of releases represented by the statement", function () {
        const st = new RealSupportStatement(
          { version_added: "1" },
          browser("chrome"),
        );
        const rels = st.supportedBy();
        assert.equal(rels.length, browser("chrome").releases.length);
      });

      // TODO: This test could be more specific. Really, handling ≤ gracefully
      // is context dependent: do you care about the releases before the start
      // of that range? If so, you should be able to opt-in to warnings or
      // errors about it.
      it("handles ≤ gracefully", function () {
        const st = new RealSupportStatement(
          { version_added: "≤11" },
          browser("chrome"),
        );
        const rels = st.supportedBy();
        assert.equal(rels.length, browser("chrome").releases.length - 10);
      });
    });
  });
});
