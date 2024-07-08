import { Temporal } from "@js-temporal/polyfill";
import { BASELINE_LOW_TO_HIGH_DURATION } from "./index.js";

export function toHighDate(
  lowDate: Parameters<typeof Temporal.PlainDate.from>[0],
): Temporal.PlainDate {
  const startDate = Temporal.PlainDate.from(lowDate);
  return startDate.add(BASELINE_LOW_TO_HIGH_DURATION);
}

export function toDateString(date: Temporal.PlainDate): string {
  return date.toString().slice(0, 10);
}
