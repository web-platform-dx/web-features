import { Temporal } from "@js-temporal/polyfill";
import { BASELINE_LOW_TO_HIGH_DURATION } from "../constants";

type LowDate = Temporal.PlainDate | string;

export function toHighDate(lowDate: LowDate): Temporal.PlainDate {
  const startDate =
    typeof lowDate === "string" ? Temporal.PlainDate.from(lowDate) : lowDate;

  return startDate.add(BASELINE_LOW_TO_HIGH_DURATION);
}

export function toDateString(date: Temporal.PlainDate): string {
  return date.toString().slice(0, 10);
}
