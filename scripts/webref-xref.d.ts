// Type declarations for @webref/xref, which ships no types.
// API: https://github.com/w3c/webref/blob/main/packages-auto/xref/README.md
declare module "@webref/xref" {
  interface XrefEntry {
    id?: string;
    href: string;
    title?: string;
    linkingText?: string[];
    type?: string;
    spec: string;
    version: "nightly" | "release";
  }

  interface XrefMatch {
    source: "dfns" | "headings";
    entry: XrefEntry;
  }

  interface LookupOptions {
    standing?: "good" | "pending" | "discontinued";
    version?: "nightly" | "release";
    series?: boolean;
  }

  function setup(rootFolder?: string): void;
  function lookup(url: string, options?: LookupOptions): XrefMatch[];

  export { setup, lookup, XrefEntry, XrefMatch, LookupOptions };
}
