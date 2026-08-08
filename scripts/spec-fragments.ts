// Fragment-level validation of spec URLs against @webref/xref, which knows the
// definition and heading anchors of every spec crawled by w3c/webref.
//
// The rules deliberately mirror BCD's spec_url linter so that both projects
// accept the same URLs. See:
// https://github.com/mdn/browser-compat-data/blob/main/lint/linter/test-spec-urls.js
// https://github.com/web-platform-dx/web-features/issues/84

import * as xref from "@webref/xref";
import type { XrefMatch, LookupOptions } from "@webref/xref";

type LookupFunction = (url: string, options?: LookupOptions) => XrefMatch[];

export type FragmentResult =
  | { status: "valid"; matches: XrefMatch[] }
  | { status: "invalid" }
  | { status: "skipped"; reason: "no-fragment" | "text-fragment-only" };

let initialized = false;

/**
 * Check a spec URL's fragment against webref's known anchors. Returns the
 * matching webref entries on success (each names its spec's shortname), rather
 * than a bare boolean, so callers can cross-reference with web-specs.
 *
 * Page-level validity (is this a spec web-features may cite at all?) is out of
 * scope here; check that separately against web-specs.
 */
export function validateSpecFragment(
  url: URL,
  lookup: LookupFunction = xref.lookup,
): FragmentResult {
  if (lookup === xref.lookup && !initialized) {
    xref.setup();
    initialized = true;
  }

  let target = new URL(url);

  if (!target.hash) {
    return { status: "skipped", reason: "no-fragment" };
  }

  // A text fragment (`#:~:text=…`) can't be validated, but a section id
  // preceding it (`#section:~:text=…`) can.
  if (target.hash.includes(":~:text=")) {
    const sectionId = target.hash.split(":~:text=")[0].replace(/^#/, "");
    if (!sectionId) {
      return { status: "skipped", reason: "text-fragment-only" };
    }
    target = new URL(target);
    target.hash = sectionId;
  }

  const matches = lookup(target.toString(), {
    series: true,
    standing: "good",
  });
  return matches.length ? { status: "valid", matches } : { status: "invalid" };
}
