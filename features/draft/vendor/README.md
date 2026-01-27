# Draft vendor features

This directory is for features proposed by a browser vendor, to support the
early use of web-features before there is a published web-features ID, and a
way to transition from draft to published feature IDs.

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
