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
