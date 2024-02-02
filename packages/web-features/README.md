# Curated list of Web platform features

This package is experimental, expect frequent breaking changes!

## Usage

```sh
npm install web-features
```

```js
import webFeatures from 'web-features';
// import webFeatures from 'web-features/index.json' with { type: 'json' }
```

## Rendering Baseline statuses with `web-features`

If you're using `web-features` to render Baseline iconography or browser logos with support markers, then you must follow these procedures to ensure consistent usage.

For Baseline iconography, follow this procedure for each feature:

1. If `status.baseline` is `"high"`, then show an affirmative "widely available" icon.
1. If `status.baseline` is `"low"`, then show an affirmative "newly available" icon.
1. If `status.baseline` is `false`, then show a "limited availability" non-Baseline icon.
1. If `status.baseline` is `undefined`, then **do not** show any Baseline or non-Baseline badge.

For browser support iconography (that is, browser logos and checkmarks and Xs), follow this procedure for each browser:

1. **Do not** show a version number, whether one is provided.
1. If `status.baseline` is `"high"` or `"low"`, then show a green checkmark (✅, "supported") beside each browser's logo icon.
1. If `status.baseline` is `false` and the browser's `status.support` key (for example, `status.support.edge`) is `undefined` or `false`, then show a gray X ("unsupported") beside the browser's logo icon.
1. If `status.baseline` is `"high"` or `"low"` and the browser's `status.support` key is a string, then show a green checkmark ("supported") beside the brower's logo icon.
