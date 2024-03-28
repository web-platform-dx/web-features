import { Temporal } from "@js-temporal/polyfill";

// Number of months after Baseline low that Baseline high happens. Keep in sync with definition:
// https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md#wider-support-high-status
export const BASELINE_LOW_TO_HIGH_DURATION = Temporal.Duration.from({
  months: 30,
});
