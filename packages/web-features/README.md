# Curated list of Web platform features

[web-features](https://web-platform-dx.github.io/web-features/web-features/) is the package that describes Web platform features and provides [Baseline](https://web-platform-dx.github.io/web-features/) status reports.

Subscribe to the [Upcoming changes](https://github.com/web-platform-dx/web-features/discussions/2613) announcements thread for news about upcoming releases, such as breaking changes or major features.

## Usage

```sh
npm install web-features
```

```js
import { browsers, features, groups, snapshots } from "web-features";
```

Or, without Node.js:

```js
import data from "web-features/data.json" with { type: "json" };
const { browsers, features, groups, snapshots } = data;
```

To import the JSON schema with or without Node.js:

```js
import schema from "web-features/data.schema.json" with { type: "json" };
```

## Rendering Baseline statuses with `web-features`

If you're using `web-features` to render Baseline iconography or browser logos with support markers, then you must follow the [name and logo usage guidelines](https://web-platform-dx.github.io/web-features/name-and-logo-usage-guidelines/).

For Baseline iconography, follow this procedure for each feature:

1. If `status.baseline` is `"high"`, then show an affirmative "widely available" icon.
1. If `status.baseline` is `"low"`, then show an affirmative "newly available" icon.
1. If `status.baseline` is `false`, then show a "limited availability" non-Baseline icon.

   **Note**: All features that have the `discouraged` property are, by definition, non-Baseline, and `status.baseline` will be `false`.
   If a feature has the `discouraged` property, consider showing a message describing the feature's discouraged status instead of Baseline iconography.
   Showing Baseline iconography for discouraged features may confuse readers.

1. If `status.baseline` is `undefined`, then **do not** show any Baseline or non-Baseline badge.

For browser support iconography (that is, browser logos and checkmarks and Xs), follow this procedure for each browser:

1. If `status.baseline` is `"high"` or `"low"`, then show a green checkmark (✅, "supported") beside each browser's logo icon.
1. If `status.baseline` is `false` and the browser's `status.support` key (for example, `status.support.edge`) is `undefined` or `false`, then show a gray X ("unsupported") beside the browser's logo icon.
1. If `status.baseline` is `"high"` or `"low"` and the browser's `status.support` key is a string, then show a green checkmark ("supported") beside the browser's logo icon.

If you wish to report browser version numbers, avoid showing version numbers alone.
Developers and users often do not know whether a version number refers to a very recent or old release.
If you must show a version number, consider contextualizing that number by showing a release date, a relative date (such as "Released … years ago"), an offset (such as "… releases ago"), or usage statistics relevant to your audience (such as "…% of your visitors in the last 90 days").

## Schema reference

This part of the README summarizes the schema for feature data.
See `data.schema.json` for a canonical reference.

## `features`

The `features` object contains data for features.
Each key is a feature ID string and values describe the feature.
Most values are ordinary feature objects with names, descriptions, and other data.
Some features contain redirects to other features.
You can distinguish between ordinary feature objects and redirects by using the `kind` property:

* `"feature"` — ordinary features  
* `"moved"` — the feature has a redirect to a new key
* `"split"` — the feature has a redirect to two or more keys

### Feature objects

A feature with the `kind` set to `"feature"` is an ordinary feature.
It has the following properties:

- `kind` (value: `"feature"`): A type discriminator
- `name` (type: `string`): A plain-text human-readable name for the feature
- `description` (type: `string`): A short plain-text description of the feature
- `description_html` (type: `string`): A short HTML-formatted description of the feature
- `spec` (type: `string[]`): A specification URL or an array of them
- `status`: Support status data.
  It has the following properties:

  - `baseline` (type: `"high" | "low" | false`): Whether the feature Baseline widely available, Baseline newly available, or not Baseline
  - `baseline_low_date` (optional, type: `string`): When the feature reached Baseline newly available status
  - `baseline_high_date` (optional, type: `string`): When the feature reached Baseline widely available status
  - `support`: An object representing per-browser support information, showing the version number where each browser first started to support that feature.
    All keys are optional.
    Keys are one of: `"chrome"`, `"chrome_android"`, `"edge"`, `"firefox"`, `"firefox"`, `"firefox_android"`, `"safari"`, `"safari_ios"`.
    Each value is a `string` containing the version number.

- `group` (optional, type: `string[]`): A `groups` key or an array of them
- `snapshot` (optional, type: `string[]`): A `snapshots` key or an array of them
- `caniuse` (optional, type: `string[]`): A caniuse feature ID that corresponds to the current feature, or an array of them.
  Use it to look up caniuse data from a package like [`caniuse-lite`](https://www.npmjs.com/package/caniuse-lite) or construct a URL to a page on caniuse.com.
- `compat_features` (optional, type: `string[]`): An array of `@mdn/browser-compat-data` feature key strings.
- `discouraged` (optional): An object indicating that web developers should avoid using the feature.
  It has the following properties:

  - `according_to` (type: `string[]`): One or more links to a formal discouragement notice, such as specification text or an intent-to-unship
  - `alternatives` (optional, type: `string[]`): One or more feature IDs (as in `features[alternatives[0]]`) that substitute some or all of this feature's utility

### Moved objects

A feature with the `kind` set to `"moved"` is a redirect to another feature.
It says that this feature ID is actually best represented by the data given by another ID.
If you’re showing web-features data to developers, then treat this like an HTTP 301 redirect and go directly to the feature it points to.

A moved feature has the following properties:

- `kind` (value: `"moved"`): A type discriminator
- `redirect_target` (type: `string`): The ID of a feature (as in `features[redirect_target]`).
  The ID is guaranteed to be an ordinary, non-redirecting feature.
  Double redirects and cycles are forbidden.

### Split objects

A feature with the `kind` set to `"split"` is a redirect to multiple other features.
It says that this feature ID is actually best represented by the data given by multiple other features and you (or your users) will have to make a choice about what to do.
You can think of this kind of feature like a [Wikipedia disambiguation page](https://en.wikipedia.org/wiki/Joker).

A split feature has the following properties:

- `kind` (value: `"split"`): A type discriminator
- `redirect_targets` (type: `string[]`): An array of two or more feature IDs, in order of greatest relevance or importance (as judged by the web-features maintainers).
  The IDs are guaranteed to be ordinary, non-redirecting features.
  Double redirects and cycles are forbidden.
