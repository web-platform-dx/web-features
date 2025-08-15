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
  Kind,
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
  SupportStatus,
};

export interface WebFeaturesData
  extends Pick<QuicktypeWebFeaturesData, "browsers" | "groups" | "snapshots"> {
  features: {
    [key: string]: FeatureData | FeatureMovedData | FeatureSplitData;
  };
}

export type FeatureData = { kind: "feature" } & Required<
  Pick<
    QuicktypeMonolithicFeatureData,
    "kind" | "description_html" | "description" | "name" | "spec" | "status"
  >
> &
  Partial<
    Pick<
      QuicktypeMonolithicFeatureData,
      "caniuse" | "compat_features" | "discouraged"
    >
  >;

export type FeatureRedirectData = { kind: Exclude<Kind, "feature"> } & Required<
  Pick<
    QuicktypeMonolithicFeatureData,
    "redirect_created_date" | "redirect_target" | "redirect_targets"
  >
>;

export interface FeatureMovedData
  extends Omit<FeatureRedirectData, "redirect_targets"> {
  kind: "moved";
}

export interface FeatureSplitData
  extends Omit<FeatureRedirectData, "redirect_target"> {
  kind: "split";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const t1: FeatureData = {
  kind: "feature",
  name: "Test",
  description: "Hi",
  description_html: "Hi",
  spec: "",
  status: {
    baseline: false,
    support: {},
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const t2: FeatureMovedData = {
  kind: "moved",
  redirect_created_date: "2025-09-01",
  redirect_target: "",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const t3: FeatureSplitData = {
  kind: "split",
  redirect_created_date: "2025-09-01",
  redirect_targets: ["", ""],
};

export type BrowserIdentifier = keyof Browsers;
