import { features } from "../index.js";
import { isOrdinaryFeatureData } from "../type-guards.js";

for (const [key, data] of Object.entries(features)) {
  if (isOrdinaryFeatureData(data)) {
    if (
      "status" in data &&
      (data.status.baseline_low_date ?? "").includes("≤")
    ) {
      console.log(key);
    }
  }
}
