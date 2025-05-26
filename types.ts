// Quicktype produces a definitions that are correct, but not as narrow or
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
  WebFeaturesData as QuicktypeWebFeaturesData,
  Release,
  SnapshotData,
  Status,
  Support,
  StatusHeadline as SupportStatus,
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
  SupportStatus
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
const t1: FeatureData = {
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
