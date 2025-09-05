// Quicktype produces definitions that are correct, but not as narrow or
// well-named as hand-written type definition might produce. This module takes
// the Quicktype-generated types as renames or modifies the types to be somewhat
// nicer to work with in TypeScript.

import type {
  BaselineEnum as BaselineHighLow,
  BrowserData,
  Browsers,
  Discouraged,
  GroupData,
  FeatureData as QuicktypeMonolithicFeatureData,
  StatusHeadline as QuicktypeStatusHeadline,
  WebFeaturesData as QuicktypeWebFeaturesData,
  Release,
  SnapshotData,
  Status,
  Support,
} from "./types.quicktype";

// Passthrough types
export type {
  BaselineHighLow,
  BrowserData,
  Browsers,
  Discouraged,
  GroupData,
  Release,
  SnapshotData,
  Status,
  Support,
};

export interface SupportStatus extends QuicktypeStatusHeadline {
  baseline: false | BaselineHighLow;
}

// These are "tests" for our type definitions.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const badQuicktypeStatusHeadline: QuicktypeStatusHeadline = {
  baseline: true, // This is an improper value in our actual published data
  support: {},
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const badSupportStatus: SupportStatus = {
  // This validates that we're actually overriding Quicktype (and correctly). If
  // `baseline: true` ever becomes possible in the `SupportStatus`, then
  // TypeScript will complain about the next line.
  // @ts-expect-error
  baseline: true,
  support: {},
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const goodSupportStatus: QuicktypeStatusHeadline | SupportStatus = {
  baseline: false,
  support: {},
};

export interface WebFeaturesData
  extends Pick<QuicktypeWebFeaturesData, "browsers" | "groups" | "snapshots"> {
  features: { [key: string]: FeatureData };
}

export type FeatureData = Required<
  Pick<
    QuicktypeMonolithicFeatureData,
    "description_html" | "description" | "name" | "spec" | "status"
  >
> &
  Partial<
    Pick<
      QuicktypeMonolithicFeatureData,
      "caniuse" | "compat_features" | "discouraged"
    >
  >;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const goodFeatureData: FeatureData = {
  name: "Test",
  description: "Hi",
  description_html: "Hi",
  spec: "",
  status: {
    baseline: false,
    support: {},
  },
};

export type BrowserIdentifier = keyof Browsers;
