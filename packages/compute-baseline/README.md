# [`compute-baseline`](https://github.com/web-platform-dx/web-features/)

By the [W3C WebDX Community Group](https://www.w3.org/community/webdx/) and contributors.

`compute-baseline` computes [Baseline statuses](https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md) from `@mdn/browser-compat-data` feature keys.
You can use `compute-baseline` to help you find interoperable web platform features, propose new [`web-features`](https://github.com/web-platform-dx/web-features/) features, or compare support between features.

`compute-baseline` also provides utility classes for working with `@mdn/browser-compat-data` generally.

## Limitations

If you need authoritative Baseline statuses, check out the [`web-features`](https://github.com/web-platform-dx/web-features/tree/main/packages/web-features) package first.
Most of the time, the status information provided by `web-features` is the best representation of a feature overall.

If you need to know the Baseline status of a specific browser compatibility data entry within a `web-features` feature, then you can use the `getStatus` method.
The `web-features` package and the `getStatus` method are the **only** ways to get a status that have completed the full Baseline editorial review process.

All other invocations of `compute-baseline` have _not_ received editorial review.
Don't use `compute-baseline` to generate publishable Baseline statuses for arbitrary web platform features.
If you're not sure whether your application fits with the definition of Baseline, please [file an issue](https://github.com/web-platform-dx/web-features/issues/new).

## Prerequisites

To use this package, you'll need:

- Node.js (a supported [current, active LTS, or maintenance LTS release](https://nodejs.org/en/about/previous-releases))

## Install

To install the package, run:

`npm install --save compute-baseline`

If you wish to specify which version of `@mdn/browser-compat-data` (or manage its upgrades explicitly, such as with Dependabot), then install the latest `@mdn/browser-compat-data` too.
Run:

`npm install --save @mdn/browser-compat-data@latest`

## Usage

### Get a Baseline status for a portion of a feature

To get a Baseline status for a specific browser compatibility data entry within a `web-features` feature, call `getStatus` with the web feature's ID and the BCD feature key as parameters, as shown below:

<!-- TODO: replace getStatus("fetch", "api.Response.json") with a call that produces different results than the main feature status, when there is one -->

```javascript
import { getStatus } from "compute-baseline";

getStatus("fetch", "api.Response.json");
```

Returns:

```
{
  baseline: 'high',
  baseline_low_date: '2017-03-27',
  baseline_high_date: '2019-09-27',
  support: {
    chrome: '42',
    chrome_android: '42',
    edge: '14',
    firefox: '39',
    firefox_android: '39',
    safari: '10.1',
    safari_ios: '10.3'
  }
}
```

### Check support for a group of compat keys

**Note**: This example returns support data that has not received an editorial review. Do not use for presenting a Baseline status. See [Limitations](#limitations).

```javascript
import { computeBaseline } from "compute-baseline";

computeBaseline({
  compatKeys: [
    "javascript.builtins.AsyncFunction",
    "javascript.builtins.AsyncFunction.AsyncFunction",
    "javascript.operators.async_function",
    "javascript.operators.await",
    "javascript.statements.async_function",
  ],
});
```

Returns:

```
{
  baseline: 'high',
  baseline_low_date: '2017-04-05',
  baseline_high_date: '2019-10-05',
  discouraged: false,
  support: Map(7) { … }
  toJSON: [Function: toJSON]
}
```

Use the `toJSON()` method to get a `web-features`-like plain JSON representation of the status.

### Check support for a single support key

**Note**: This example returns support data that has not received an editorial review. Do not use for presenting a Baseline status. See [Limitations](#limitations).

Sometimes it can be helpful to know if parent features have less support than the specific feature you're checking (for example, the parent is behind a prefix or flag) when computing a status for a deeply-nested feature.
This is typically most interesting when checking a single key.
Use the `withAncestors` option:

```javascript
import { computeBaseline } from "compute-baseline";

computeBaseline({
  compatKeys: ["api.Notification.body"],
  withAncestors: true,
});
```

### Bring your own compatibility data

**Note**: This example returns support data that has not received an editorial review. Do not use for presenting a Baseline status. See [Limitations](#limitations).

If you want to use some other source of data (such as pre-release browser-compat-data), you can bring your own schema-compatible compat data.

```javascript
import data from "some-parsed-json-file";
import { getStatus } from "compute-baseline";
import { Compat } from "compute-baseline/browser-compat-data";

const compat = new Compat(data);

getStatus("fetch", "api.Response.json", compat);
```

<!-- TODO: API reference -->

## Helping out and getting help

`compute-baseline` is part of the W3C WebDX Community Group's web-features project.
Go to [web-platform-dx/web-features](https://github.com/web-platform-dx/web-features/) for more information on contributing or getting help.
