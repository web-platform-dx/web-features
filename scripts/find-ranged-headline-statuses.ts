import { features } from "../index";

for (const [key, data] of Object.entries(features)) {
  if ((data.status.baseline_low_date ?? "").includes("≤")) {
    console.log(key);
  }
}
