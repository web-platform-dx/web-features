<!-- TODO: Add introductory text from Baseline definition -->

## Status definition

The status has two substatuses: an interoperable low status and a wider-support high status.
If a feature satisfies the requirements of both substatuses, then the high status takes precedence over the low status.

### Interoperable (low) status

This status represents the initial interoperability of a feature across many browsers.
The status marks the starting point for setting the wider support (high) status.
The status provides a versionable date for a feature.

For each feature definition in `web-features`, an interoperable status shall be assigned to the feature if the feature satisfies all of the following tests:

1. For each current stable release in the [core browser set](#core-browser-set), the release supports the feature (as reported by the current version of `@mdn/browser-compat-data`, excluding those features identified as having `partial_implementation`).
2. The feature definition does not have a value set indicating that:

   - The specification text contains discouraging language, such as a deprecation notice, obsolescence warning, or legacy tag.
   - The governance group is withholding or modifying the status (i.e., there is no editorial override of the feature’s status).

If the feature has the interoperable status, then the feature’s _keystone date_ shall be set to the last release date on which a browser introduced support for the feature
If there was more than one introduction (e.g., a feature was withdrawn then reintroduced), then only the latest date applies.

### Wider-support (high) status

For each feature definition in `web-features`, a wider-support status shall be be conferred to the feature if the feature satisfies the following test:

The feature’s keystone date is on or before today’s date minus 30 months and the dates of the following long-term support releases:

* Mozilla Firefox ESR, given by the release date for the latest x.0 release of Firefox ESR (or the previous x.0 release, when there are two active ESR releases).

This duration is selected to approximate developer signals, estimates of browser release uptake over time, an estimate of high total market share support, and the project governance group’s best judgment.

This duration is due for review by the governance group on 7 November 2024.

### Core browser set

Both the interoperable and wider-support substatuses observe support with respect to a set of browsers.
The _core browser set_ shall be defined as:

* Apple Safari (iOS)
* Apple Safari (macOS)
* Mozilla Firefox (Android)
* Mozilla Firefox (desktop)
* Google Chrome (Android)
* Google Chrome (desktop)
* Microsoft Edge (desktop)
