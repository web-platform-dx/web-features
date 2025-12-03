/* eslint-disable @typescript-eslint/no-unused-vars */
// Quicktype produces definitions that are correct, but not as narrow or
// well-named as hand-written type definition might produce. This module takes
// the Quicktype-generated types as renames or modifies the types to be somewhat
// nicer to work with in TypeScript.

import type {
  BrowserData,
  Browsers,
  Discouraged,
  GroupData,
  Kind,
  FeatureData as QuicktypeMonolithicFeatureData,
  Note as QuicktypeNote,
  Status as QuicktypeStatus,
  StatusHeadline as QuicktypeStatusHeadline,
  WebFeaturesData as QuicktypeWebFeaturesData,
  Release,
  SnapshotData,
  Support,
} from "./types.quicktype";

// Passthrough types
export type {
  BrowserData,
  Browsers,
  Discouraged,
  GroupData,
  Release,
  SnapshotData,
  Support,
};

// Quicktype interprets the schema's `baseline: false | "high" | "low"` as
// meaning `baseline: boolean | "high" | "low"`. `BaselineValue` patches it.
export type BaselineValue = "high" | "low" | false;
export interface Status extends QuicktypeStatus {
  baseline: BaselineValue;
}
export interface SupportStatus extends QuicktypeStatusHeadline {
  baseline: BaselineValue;
}
export interface RegressionNote extends QuicktypeNote {
  old_baseline_value: BaselineValue;
}

// These are "tests" for our type definitions.
const badQuicktypeStatusHeadline: QuicktypeStatusHeadline = {
  baseline: true, // This is an improper value in our actual published data
  support: {},
};
const badQuicktypeStatus: QuicktypeStatus = badQuicktypeStatusHeadline;

const badSupportStatus: SupportStatus = {
  // This validates that we're actually overriding Quicktype (and correctly). If
  // `baseline: true` ever becomes possible in the `SupportStatus`, then
  // TypeScript will complain about the next line.
  // @ts-expect-error
  baseline: true,
  support: {},
};
const badStatus: Status = {
  // @ts-expect-error
  baseline: true,
  support: {},
};
const goodSupportStatus: QuicktypeStatusHeadline | SupportStatus = {
  baseline: false,
  support: {},
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
    "description_html" | "description" | "name" | "spec" | "status"
  >
> &
  Partial<
    Pick<
      QuicktypeMonolithicFeatureData,
      | "caniuse"
      | "compat_features"
      | "discouraged"
      | "group"
      | "snapshot"
      | "notes"
    >
  >;

const goodFeatureData: FeatureData = {
  kind: "feature",
  name: "Test",
  description: "Hi",
  description_html: "Hi",
  spec: [""],
  snapshot: [""],
  group: [""],
  caniuse: [""],
  discouraged: {
    according_to: [""],
    alternatives: [""],
  },
  status: {
    baseline: false,
    support: {},
  },
};

type FeatureRedirectData = { kind: Exclude<Kind, "feature"> } & Required<
  Pick<QuicktypeMonolithicFeatureData, "redirect_target" | "redirect_targets">
>;

export interface FeatureMovedData
  extends Omit<FeatureRedirectData, "redirect_targets"> {
  kind: "moved";
}

const goodFeatureMovedData: FeatureMovedData = {
  kind: "moved",
  redirect_target: "",
};
const badFeatureMovedData: FeatureMovedData = {
  kind: "moved",
  // @ts-expect-error
  redirect_targets: ["", ""],
};

export interface FeatureSplitData
  extends Omit<FeatureRedirectData, "redirect_target"> {
  kind: "split";
}

const goodFeatureSplitData: FeatureSplitData = {
  kind: "split",
  redirect_targets: ["", ""],
};
const badFeatureSplitData: FeatureSplitData = {
  kind: "split",
  // @ts-expect-error
  redirect_target: "",
};

export type BrowserIdentifier = keyof Browsers;
