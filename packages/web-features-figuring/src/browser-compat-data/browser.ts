import { Temporal } from "@js-temporal/polyfill";
import { BrowserName, BrowserStatement } from "@mdn/browser-compat-data";

import { defaultCompat } from "./compat";
import { Release } from "./release";

const VERY_FAR_FUTURE_DATE = Temporal.Now.plainDateISO().add({
  years: 100,
});

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
  _releases: Release[] | undefined;

  constructor(id: BrowserName, data: BrowserStatement) {
    this.id = id;
    this.data = data;
  }

  toString(): string {
    return `[Browser ${this.name}]`;
  }

  get name(): string {
    return this.data.name;
  }

  releases(): Release[] {
    if (this._releases === undefined) {
      if (this.data.releases === undefined) {
        // This shouldn't happe in practice, but we must appease the type checker
        throw Error(`${this} doesn't have releases data. That's weird.`);
      }

      this._releases = [];
      for (const [key, value] of Object.entries(this.data.releases)) {
        this._releases.push(new Release(this, key, value));
      }

      this._releases.sort((a, b) =>
        Temporal.PlainDate.compare(
          a.date() ?? VERY_FAR_FUTURE_DATE,
          b.date() ?? VERY_FAR_FUTURE_DATE,
        ),
      );

      if (this.data.preview_name) {
        this._releases.push(
          new Release(this, "preview", { status: "nightly" }),
        );
      }
    }

    return this._releases;
  }

  current(): Release {
    const curr = this.releases().find((r) => r.data.status === "current");

    if (curr === undefined) {
      throw Error(`${browser} does not have a "current" release`);
    }

    return curr;
  }

  version(versionString: string): Release {
    const result = this.releases().find((r) => r.version === versionString);
    if (result === undefined) {
      throw Error(`${browser} does not have a '${versionString}' release.`);
    }
    return result;
  }
}
