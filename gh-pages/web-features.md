---
permalink: web-features
---

# web-features

web-features is an effort to build a shared catalog of features of the web platform. By creating a common list of features and their definitions, web-features aims to improve understanding of what web developers get and want from the web. web-features does this by:

- Creating feature definitions, which identify and describe capabilities of the web.
- Generating Baseline support data, which summarizes the availability of web features across key browsers and releases.
- Publishing the [web-features npm package](https://www.npmjs.com/package/web-features), which bundles feature identifiers with Baseline statuses.

## What is a feature?

Think of features as individual components of the web platform that web developers can use to achieve specific tasks.

As such, a feature has no specific size. A feature might cover a single CSS property, an entire JavaScript APIs with multiple interfaces, methods, and properties, or a combination of CSS properties, HTML elements, and JavaScript APIs. As long as a web developer would use the feature to achieve a specific goal, it's a feature.

For example, the `fetch()` API is a feature, the `:has()` CSS pseudo-class function too, and so is the Web Audio API.

## How is a feature described?

Features in the [web-features repository](https://github.com/web-platform-dx/web-features/) are authored as YAML files that are stored in the [features](https://github.com/web-platform-dx/web-features/blob/main/features) directory. Each file corresponds to a single feature, and contains metadata about the feature, such as its name, description, specification, or support data.

For example, the `fetch()` API feature is described in the [features/fetch.yml](https://github.com/web-platform-dx/web-features/blob/main/features/fetch.yml) file.

In addition to meta information about the feature, the various parts that come together to make the feature are identified using [@mdn/browser-compat-data](https://github.com/mdn/browser-compat-data) (BCD) entries. BCD holds fine-grained support data for most web platform features; this is used to build up each feature definition, identifying all of the component parts.

See [What makes a feature](https://github.com/web-platform-dx/web-features/blob/main/docs/CONTRIBUTING.md#what-makes-a-feature) for more details.

## How does web-features relate to Baseline?

The web-features project computes, reviews, and publishes Baseline statues. Therefore, web-features is the source of truth for Baseline statuses.

## Get involved

It’s a huge effort to describe the entire web platform in this way and will be an ongoing one given that new web platform features are released every month. Help out by contributing feature definitions. See the [contributing information](https://github.com/web-platform-dx/web-features/blob/main/docs/CONTRIBUTING.md) for more details.
