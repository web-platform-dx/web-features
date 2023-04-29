# Curated list of Web platform features

This package is experimental, expect frequent breaking changes!

## Usage

```sh
npm install web-features
```

```js
import webFeatures from 'web-features' assert { type: 'json' };
```

## Rendering baseline statuses with `web-features`

If you're using `web-features` to render baseline iconography (green check logo and yellow X caution logo) or browser logos with support markers, then you must follow these procedures to ensure consistent usage.

For baseline iconography, follow this procedure for each feature:

1. If `status.is_baseline` is `true`, then show the baseline (🟢 affirmative, green check) badge.
1. If `status.is_baseline` is `false`, then show the non-baseline (🟡 caution, yellow X) badge.
1. If `status.is_baseline` is `undefined`, then **do not** show any baseline or non-baseline badge.

For browser support iconography (that is, browser logos and checkmarks and Xs), follow this procedure, for each feature and browser (Chrome, Edge, Firefox, and Safari):

0. **Do not** show a version number, whether one is provided.
1. If `status.is_baseline` is `true`, then show a green checkmark (✅) beside each browser's logo icon.
2. If `status.is_basline` is `false` and the browser's `status.support` key (for example, `status.support.edge`) is `undefined` or `false`, then show a gray X ("unsupported") beside the browser's logo icon.
3. If `status.is_basline` is `true` and the browser's `status.support` key is a string, then show a green checkmark ("supported") beside the brower's logo icon.
