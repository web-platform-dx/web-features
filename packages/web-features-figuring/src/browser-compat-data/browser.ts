import { Temporal } from "@js-temporal/polyfill";
import {
  BrowserName,
  BrowserStatement,
  ReleaseStatement,
} from "@mdn/browser-compat-data";

import { defaultCompat } from "./compat";
import { Release } from "./release";
import { VERY_FAR_FUTURE_DATE } from "../constants";

export function browser(id: string, compat = defaultCompat): Browser {
  let b = compat.browsers.get(id);
  if (b) {
    return b;
  }

  const data = compat.query(`browsers.${id}`) as BrowserStatement;
  b = new Browser(id as BrowserName, data);
  compat.browsers.set(id, b);
  return b;
}

export class Browser {
  id: BrowserName;
  data: BrowserStatement;
  releases: ReadonlyArray<Release>;

  constructor(id: BrowserName, data: BrowserStatement) {
    this.id = id;
    this.data = data;

    const sortedReleaseData: [version: string, data: ReleaseStatement][] = [];
    sortedReleaseData.push(
      ...Object.entries(data.releases).sort((a, b) =>
        `${a[1].release_date}`.localeCompare(`${b[1].release_date}`),
      ),
    );

    const releases = sortedReleaseData.map(
      ([version, data], index) => new Release(this, version, data, index),
    );
    if (this.data.preview_name) {
      releases.push(
        new Release(this, "preview", { status: "nightly" }, releases.length),
      );
    }
    this.releases = releases;
  }

  toString(): string {
    return `[Browser ${this.name}]`;
  }

  get name(): string {
    return this.data.name;
  }

  current(): Release {
    const curr = this.releases.find((r) => r.data.status === "current");

    if (curr === undefined) {
      throw Error(`${browser} does not have a "current" release`);
    }

    return curr;
  }

  version(versionString: string): Release {
    const result = this.releases.find((r) => r.version === versionString);
    if (result === undefined) {
      throw Error(`${browser} does not have a '${versionString}' release.`);
    }
    return result;
  }
}

function sorter(a: Temporal.PlainDate | null, b: Temporal.PlainDate | null) {
  // Sort nulls after dates
  if (a === null) {
    return b === null ? 0 : 1;
  }
  if (b === null) {
    return -1;
  }

  return Temporal.PlainDate.compare(a, b);
}
