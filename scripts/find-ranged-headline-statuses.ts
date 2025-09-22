import { features } from "../index";
import { isOrdinaryFeatureData } from "../type-guards";

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
