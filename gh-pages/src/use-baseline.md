---
title: Baseline in your project
description: How to use the Baseline in your project.
layout: "default.html"
---

You can use Baseline to:

- Make decisions about what web platform features to use in your sites and applications
- Tell others whether features work across browsers

## Check if a feature works across browsers

When visiting sites like [Can I Use](https://caniuse.com), [MDN Web Docs](https://developer.mozilla.org/), and [RUM Archive Insights](https://rumarchive.com/insights/#baseline) check the status of a feature to learn if it is available across browsers.

## Let others know when a feature works across browsers

Are you writing a blog post or article or presenting at a conference? Use the [Baseline logos](/name-and-logo-usage-guidelines/) as a shorthand to let your audience know the status of a feature.

The [`<baseline-status>` web component](https://github.com/web-platform-dx/baseline-status) is also available to include on your site or pages to indicate the status of a web feature. It renders at run-time, so it’s always up to date with the latest Baseline status.

## Use the API

This site serves features via an API. These features are up to date with the `main` branch, and may be ahead of the latest release.

### List features

Returns a list of the keys of all existing features.

`GET https://web-platform-dx.github.io/api/v1/features.json`

```json
{
  "features": [
    "a",
    "abbr",
    ...
    "zoom",
    "zstd"
  ]
}
```

[Example](https://web-platform-dx.github.io/api/v1/features.json)

### Read feature

Returns the data for a specific feature.

`GET https://web-platform-dx.github.io/api/v1/features/[featureId].json`

```json
{
  "compat_features": [
    ...
  ],
  "description": "",
  "description_html": "",
  "group": "html-elements",
  "name": "\u003Ca\u003E",
  "spec": "",
  "status": {
    ...
  },
  "id": "a"
}
```

The data is `FeatureData` as defined in the [Web Features schema](https://github.com/web-platform-dx/web-features/blob/main/schemas/data.schema.json#L27), with the addition of the `id` key.

[Example](https://web-platform-dx.github.io/api/v1/features/a.json)
