import type { FeatureData } from "./types";
import type { Status } from "./types.quicktype";
declare const browsers: import("./types.quicktype").Browsers,
  features: {
    [key: string]:
      | FeatureData
      | import("./types").FeatureMovedData
      | import("./types").FeatureSplitData;
  },
  groups: {
    [key: string]: import("./types.quicktype").GroupData;
  },
  snapshots: {
    [key: string]: import("./types.quicktype").SnapshotData;
  };
/**
 * Get the baseline status for a specific browser compatibility key.
 * @param featureId - Optional feature ID to search within (improves performance if known)
 * @param bcdKey - The browser compatibility data key (e.g., "api.HTMLElement.focus")
 * @returns The baseline status object for the key, or undefined if not found
 */
declare function getStatus(
  featureId: string | undefined,
  bcdKey: string,
): Status | undefined;
export { browsers, features, groups, snapshots, getStatus };
