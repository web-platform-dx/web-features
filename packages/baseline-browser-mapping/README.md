# [`baseline-browser-mapping`](https://github.com/web-platform-dx/web-features/packages/baseline-browser-mapping)

By the [W3C WebDX Community Group](https://www.w3.org/community/webdx/) and contributors.

`baseline-browser-mapping` exposes arrays of browsers compatible with Baseline Widely Available and specified Baseline year feature sets.
You can use `baseline-browser-mapping` to help you determine minimum browser version support for your chosen Baseline feature set.

## Limitations

The browser versions in this module come from two different sources:

* MDN's `browser-compat-data` module.
* Parsed user agent strings provided by [useragents.io](https://useragents.io/)

MDN `browser-compat-data` is an authoritative source of information for the browsers it contains.  The release dates for the Baseline core browser set and the mapping of downstream browsers to Chromium versions should be considered accurate.

The browser mappings from useragents.io are provided on a best effort basis.  They assume that browser vendors are accurately stating the Chromium version they have implemented. 

Unfortunately, useragents.io does not have "first seen" dates prior to June 2025. However, these browsers' Baseline compatibility is determined by their Chromium version, so their release dates are more informative than critical.

## Prerequisites

To use this package, you'll need:

- Node.js (a supported [current, active LTS, or maintenance LTS release](https://nodejs.org/en/about/previous-releases))

## Install

To install the package, run:

`npm install --save baseline-browser-mapping`

If you wish to specify which version of `@mdn/browser-compat-data` (or manage its upgrades explicitly, such as with Dependabot), then install the latest `@mdn/browser-compat-data` too.
Run:

`npm install --save @mdn/browser-compat-data@latest`

Updating this module and browser-compat-data regularly is recommended if you are targeting Baseline Widely Available to ensure you have the most up to date downstream browsers.

## Usage

### 


## Helping out and getting help

`compute-baseline` is part of the W3C WebDX Community Group's web-features project.
Go to [web-platform-dx/web-features](https://github.com/web-platform-dx/web-features/) for more information on contributing or getting help.
