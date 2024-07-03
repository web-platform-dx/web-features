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

    describe("toReleaseSupportMap()", function () {
      it("expands false values to unsupported", function () {
        const cr = browser("chrome");
        const statement = new SupportStatement({ version_added: false }, cr);
        const supportMap = statement.toReleaseSupportMap();

        assert.equal(supportMap.size, cr.releases.length);
        for (const { supported } of supportMap.values()) {
          assert.equal(supported, false);
        }
      });

      it("expands null values to unknown support", function () {
        const cr = browser("chrome");
        const statement = new SupportStatement({ version_added: null }, cr);
        const supportMap = statement.toReleaseSupportMap();

        assert.equal(supportMap.size, cr.releases.length);
        for (const { supported } of supportMap.values()) {
          assert.equal(supported, null);
        }
      });

      it("expands true values to supported in current and future releases", function () {
        const cr = browser("chrome");
        const statement = new SupportStatement({ version_added: true }, cr);
        const supportMap = statement.toReleaseSupportMap();

        assert.equal(supportMap.size, cr.releases.length);
        assert.equal(supportMap.get(cr.current())?.supported, true);
        assert.equal(
          supportMap.get(cr.releases.at(-1) as any)?.supported,
          true,
        );
      });

      it("expands open-ended statements to (unsupported, …, supported, …)", function () {
        const cr = browser("chrome");
        const statement = new SupportStatement({ version_added: "100" }, cr);
        const supportMap = statement.toReleaseSupportMap();
        const entries = [...supportMap.entries()];

        assert.equal(supportMap.size, entries.length);
        assert.equal(supportMap.get(cr.version("1"))?.supported, false);
        assert.equal(supportMap.get(cr.version("99"))?.supported, false);
        assert.equal(supportMap.get(cr.version("100"))?.supported, true);
        assert.equal(supportMap.get(cr.version("101"))?.supported, true);
        assert.equal(supportMap.get(cr.current())?.supported, true);
        assert.equal(
          supportMap.get(cr.releases.at(-1) as any)?.supported,
          true,
        );
      });

      it("expands ranged open-ended statements to (unknown, …, supported, …)", function () {
        const cr = browser("chrome");
        const statement = new SupportStatement({ version_added: "≤100" }, cr);
        const supportMap = statement.toReleaseSupportMap();
        const entries = [...supportMap.entries()];

        assert.equal(supportMap.size, entries.length);
        assert.equal(supportMap.get(cr.version("1"))?.supported, null);
        assert.equal(supportMap.get(cr.version("99"))?.supported, null);
        assert.equal(supportMap.get(cr.version("100"))?.supported, true);
        assert.equal(supportMap.get(cr.version("101"))?.supported, true);
        assert.equal(supportMap.get(cr.current())?.supported, true);
        console.log(cr.releases.at(-1) as any);
        console.log(supportMap.get(cr.releases.at(-1) as any));
        assert.equal(
          supportMap.get(cr.releases.at(-1) as any)?.supported,
          true,
        );
      });

      it("expands ranged closed statements to (unknown, …, supported, …, unsupported, …)", function () {
        const cr = browser("chrome");
        const statement = new SupportStatement(
          { version_added: "≤100", version_removed: "125" },
          cr,
        );
        const supportMap = statement.toReleaseSupportMap();
        const entries = [...supportMap.entries()];

        assert.equal(supportMap.size, entries.length);
        assert.equal(supportMap.get(cr.version("1"))?.supported, null);
        assert.equal(supportMap.get(cr.version("99"))?.supported, null);
        assert.equal(supportMap.get(cr.version("100"))?.supported, true);
        assert.equal(supportMap.get(cr.version("101"))?.supported, true);
        assert.equal(supportMap.get(cr.version("124"))?.supported, true);
        assert.equal(supportMap.get(cr.version("125"))?.supported, false);
        assert.equal(supportMap.get(cr.version("126"))?.supported, false);
        assert.equal(supportMap.get(cr.current())?.supported, false);
        assert.equal(
          supportMap.get(cr.releases.at(-1) as any)?.supported,
          false,
        );
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
