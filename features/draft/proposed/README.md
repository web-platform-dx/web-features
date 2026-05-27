# Proposed features

This directory is for proposed features, to support the early use of
web-features before there is a published feature, with a way to transition from
a proposed ID to the eventual published feature's ID.

Proposed features can be referred to using the `proposed/a-feature` notation in
external projects, and the `proposed/` prefix is reserved for this use in
web-features.

A proposed feature goes through these stages:

- A bot creates a `.yml` file in this directory, with enough information for a
  maintainer of web-features to follow up and act on. An `explainer` or `spec`
  URL and a proposed-specific URL like `chromestatus` is recommended.
- A web-features maintainer creates a real feature entry and replaces the
  proposed feature with a pointer to that feature.
- References to the proposed feature in tools or source code are updated to
  point to the final feature.

Write access for bots can be granted by web-features maintainers, and should
only be used to create files in this directory.

## Example

The [processing instructions in HTML](https://chromestatus.com/feature/6534495085920256)
feature is created as `proposed/html-pis.yml` file with this contents:

```yml
# features/draft/proposed/html-pis.yml
explainer: https://github.com/WICG/declarative-partial-updates/blob/main/patching-explainer.md
chromestatus: https://chromestatus.com/feature/6534495085920256
```

When the real web-features entry is created, it is decided to consider this part
of `<template for>`, so the proposed feature is updated like this:

```yml
# features/draft/proposed/html-pis.yml
kind: moved
redirect_target: template-for
```

Any references to `proposed/html-pis` can be updated to refer to `template-for`.
