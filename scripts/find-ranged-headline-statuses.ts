import { features } from "../index.ts";
import { isOrdinaryFeatureData } from "../type-guards.ts";

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
