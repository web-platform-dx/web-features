# [`baseline-browser-mapping`](https://github.com/web-platform-dx/web-features/packages/baseline-browser-mapping)

By the [W3C WebDX Community Group](https://www.w3.org/community/webdx/) and contributors.

`baseline-browser-mapping` exposes arrays of browsers compatible with Baseline Widely Available and specified Baseline year feature sets.
You can use `baseline-browser-mapping` to help you determine minimum browser version support for your chosen Baseline feature set.



## Limitations

The browser versions in this module come from two different sources:

* MDN's `browser-compat-data` module.
* Parsed user agent strings provided by [useragents.io](https://useragents.io/)

MDN `browser-compat-data` is an authoritative source of information for the browsers it contains.  The release dates for the Baseline core browser set and the mapping of downstream browsers to Chromium versions should be considered accurate.

Browser mappings from useragents.io are provided on a best effort basis.  They assume that browser vendors are accurately stating the Chromium version they have implemented.

> **TODO** Add details on how downstream mappings were created and are updated once script and action are in place and tested in @tonypconway 's fork.

Unfortunately, useragents.io does not have "first seen" dates prior to June 2020. However, these browsers' Baseline compatibility is determined by their Chromium version, so their release dates are more informative than critical.

> **Note**
> At present, the selection criteria for core browser versions compatible with a given feature set is: the final version of each browser prior to the cut off date for that feature set.  In the case of Widely Available, this is 30 months in the past and in the case of Baseline years, this is the end of the year specified.  In future, when the `web-features` repository is data complete, it should be possible to determine if earlier browser versions support the specified feature set.

## Prerequisites

To use this package, you'll need:

* Node.js (a supported [current, active LTS, or maintenance LTS release](https://nodejs.org/en/about/previous-releases))

## Install

To install the package, run:

`npm install --save baseline-browser-mapping`

If you wish to specify which version of `@mdn/browser-compat-data` (or manage its upgrades explicitly, such as with Dependabot), then install the latest `@mdn/browser-compat-data` too.
Run:

`npm install --save @mdn/browser-compat-data@latest`

Updating this module and `@mdn/browser-compat-data` regularly is recommended to ensure you have the most up to date downstream browsers.

## Usage

### Import the module

First, import the module:

```javascript
import baselineBrowserMapping from "baseline-browser-mapping";
```

### Get Baseline Widely Available browser versions

To get the current list of minimum browser versions compatible with Baseline Widely Available features from the core browser set, call the `getMinimumWidelyAvailable` method:

```javascript
baselineBrowserMapping.getMinimumWidelyAvailable()
```

Executed on 29th November 2024, the above code returns the final version of each core browser released on or before 24th May 2022 i.e. 30 months before the date of execution:

```javascript
[
  {
    browser: 'chrome',
    version: '102',
    release_date: '2022-05-24',
    engine: null,
    engine_version: null
  },
  {
    browser: 'chrome_android',
    version: '102',
    release_date: '2022-05-24',
    engine: null,
    engine_version: null
  },
  {
    browser: 'edge',
    version: '101',
    release_date: '2022-04-28',
    engine: null,
    engine_version: null
  },
  {
    browser: 'firefox',
    version: '100',
    release_date: '2022-05-03',
    engine: null,
    engine_version: null
  },
  {
    browser: 'firefox_android',
    version: '100',
    release_date: '2022-05-03',
    engine: null,
    engine_version: null
  },
  {
    browser: 'safari',
    version: '15.5',
    release_date: '2022-05-16',
    engine: null,
    engine_version: null
  },
  {
    browser: 'safari_ios',
    version: '15.5',
    release_date: '2022-05-16',
    engine: null,
    engine_version: null
  }
]
```

If you need a list of _all_ compatible versions, you can call:

```javascript
baselineBrowserMapping.getAllWidelyAvailable()
```

### Get Baseline Widely Available compatible browser versions as of a specific date

To get the minimum browser versions that supported Baseline Widely Available on a specific date, call `getMinimumWidelyAvailableOnDate` or `geAllWidelyAvailableOnDate`, passing the desired date in the format `YYYY-MM-DD`:

```javascript
baselineBrowserMapping.getMinimumWidelyAvailableOnDate('2021-03-19')
```

This would return the final version of each core browser released on or before 19th September 2018 i.e. 30 months before 19th March 2021.

### Get Baseline year compatible browser versions

To get the list of browser versions that support a particular year's Baseline feature set, call `getMinimumByYear` or `getAllByYear` passing the desired year in the format YYYY:

```javascript
baselineBrowserMapping.getMinimumByYear('2020')

```

### Including downstreambrowsers

Each of the methods above can take an optional final boolean parameter `includeDownstream`.  The default for this in all functions is `false`.  To include downstream browsers, pass `true` as the final parameter when you call the function:

```javascript
baselineBrowserMapping.getAllWidelyAvailable(true)

baselineBrowserMapping.getMinimumWidelyAvailableOnDate('2021-03-19' true)

baselineBrowserMapping.getMinimumByYear('2020', true)
```

Passing `true` will include the appropriate versions of the browsers listed as "Core" = `false` below.

## Currently included browsers

| Browser               | ID                        | Core    | Source                    |
| --------------------- | ------------------------- | ------- | ------------------------- |
| Chrome                | `chrome`                  | `true`  | MDN `browser-compat-data` |
| Chrome  for Android   | `chrome_android`          | `true`  | MDN `browser-compat-data` |
| Edge                  | `edge`                    | `true`  | MDN `browser-compat-data` |
| Firefox               | `firefox`                 | `true`  | MDN `browser-compat-data` |
| Firefox for Android   | `firefox_android`         | `true`  | MDN `browser-compat-data` |
| Safari                | `safari`                  | `true`  | MDN `browser-compat-data` |
| Safari on iOS         | `safari_ios`              | `true`  | MDN `browser-compat-data` |
| Opera                 | `opera`                   | `false` | MDN `browser-compat-data` |
| Opera Android         | `opera_android`           | `false` | MDN `browser-compat-data` |
| Samsung Internet      | `samsunginternet_android` | `false` | MDN `browser-compat-data` |
| WebView Android       | `webview_android`         | `false` | MDN `browser-compat-data` |
| QQ Browser Mobile     | `qq_android`              | `false` | useragents.io             |
| UC Browser Mobile     | `UC_android`              | `false` | useragents.io             |
| Yandex Browser Mobile | `ya_android`              | `false` | useragents.io             |

> **Note**
> All the non-core browsers currently included implement Chromium.  Their inclusion in any of the above functions is based on the Baseline feature set supported by the Chromium version they implement, not their release date.

## Helping out and getting help

`baseline-browser-mapping` is part of the W3C WebDX Community Group's web-features project.
Go to [web-platform-dx/web-features](https://github.com/web-platform-dx/web-features/) for more information on contributing or getting help.
