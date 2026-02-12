# Draft vendor features

This directory is for features proposed by a browser vendor, to support the
early use of web-features before there is a published web-features ID, and a
way to transition from draft to published feature IDs.

Draft vendor features can be referred to using the `vendor/a-feature` notation
in external projects, and the `vendor/` prefix is reserved for this use in
web-features. 

A draft vendor feature goes through these stages:

- A bot creates a `.yml` file in this directory, with enough information for a
  maintainer of web-features to follow up and act on. An `explainer` or `spec`
  URL and a vendor-specific URL like `chromestatus` is recommended.
- A web-features maintainer creates a real feature entry and replaces the draft
  feature with a pointer to that feature.
- References to the draft feature in vendor tools or source code are updated to
  point to the final features.

Write access for bots can be granted by web-features maintainers, and should
only be used to create files in this directory.

## Example

The [processing instructions in HTML](https://chromestatus.com/feature/6534495085920256)
feature is created as `vendor/html-pis.yml` file with this contents:

```yml
# features/draft/vendor/html-pis.yml
explainer: https://github.com/WICG/declarative-partial-updates/blob/main/patching-explainer.md
chrometatus: https://chromestatus.com/feature/6534495085920256
```

When the real web-features entry is created, it is decided to consider this part
of `<template for>`, so the draft vendor feature is updated like this:

```yml
# features/draft/vendor/html-pis.yml
kind: moved
redirect_target: template-for
```

Any references to `vendor/html-pis` can be updated to refer to `template-for`.
