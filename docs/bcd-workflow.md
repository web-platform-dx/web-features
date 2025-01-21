# BCD workflow

The [web-platform-dx/web-features](https://github.com/web-platform-dx/web-features/) and the [mdn/browser-compat-data](https://github.com/mdn/browser-compat-data/) depend on and complement each other. This document describes the workflows which synchronize the two projects.

## BCD keys in `compat_features`

In web-feature YAML files, the `compat_features` field consists of @mdn/browser-compat-data (BCD) entry keys (e.g., `css.properties.background-color`) that make up this feature.

If `compat_features` is not set in `<feature-id>.yml`, the `dist` script will populate `compat_features` in `<feature-id>.yml.dist` with BCD entry keys tagged with `web-features:<feature-id>` in BCD, if any exist.

If a `compat_features` list is in `<feature-id>.yml`, it takes precedence over BCD tags.

## Tagging keys in BCD directly

In this workflow, new keys in BCD are tagged from inception. This is more likely for small, incremental changes to existing features.

For example, a new key appears in BCD (e.g., via a [Collector](https://github.com/openwebdocs/mdn-bcd-collector) PR). The author of that PR knew which feature the key belongs to (e.g., due to a key being renamed) and tags the key with the correct `web-features:*` tag. A few days later, that data is released by BCD. That triggers the next `@mdn/browser-compat-data` Dependabot upgrade PR, where we regenerate web-features data based on the updated tag and remove the `compat_features` list from the YAML file (if the list and tagged keys match).

 If necessary (e.g., a tag was assigned by BCD maintainers in error), a web-features maintainer can update a `compat_features` list in web-features and the work syncs to BCD as in the workflow below.

## Listing keys in web-features

In this workflow, web-features receives unaccounted-for keys in the `features/draft` folder and BCD periodically incorporates `compat_features` as tags. This is more likely for new features.

For example, a new key appears in BCD (e.g., via a [Collector](https://github.com/openwebdocs/mdn-bcd-collector PR). The author of that PR doesn't know or doesn't care which feature that key belongs to and does not tag it. A few days later, that data is released by BCD. That triggers the next `@mdn/browser-compat-data` Dependabot upgrade PR. After that PR merges, we run the "Update draft features" workflow, which makes the new keys to appear in the `features/draft` folder. At this point, a web-features maintainer can assign the key to an existing feature or author a new feature. A few days later, that data is released by web-features. When BCD upgrades `web-features`, it'll automatically apply tags to each feature according to the `compat_features` list.

## Circular changes

To prevent circular changes:

- BCD contributors must never create a new tag before the corresponding ID appears in web-features.
- web-features contributors must never manually remove a `compat_features` list from a feature.

To ensure ongoing completeness, web-features maintainers ought to strive to keep generated drafts to an absolute minimum.
