# Project documentation

## Feature guidelines

### Identifiers

Feature identifiers must contain only lowercase alphanumeric characters (`a`-`z` and `0-9`) plus the `-` character (hyphen or minus sign) as a word separator.

Feature authors should (in descending order of priority):

- Prefer identifiers to known to be in widespread use by web developers.
  Favor describing things as they are most-widely known, even if it's not the most technically correct option.

  - 👍 Recommended: `javascript`
  - 👎 Not recommended: `ecmascript`

- Avoid prefixing identifiers that mark a feature as specific to a technology, such as `css-` or `js-`.
  Features can and do cross such boundaries.

  - 👍 Recommended: `container-queries`
  - 👎 Not recommended: `css-container-queries`

- Avoid frequently-used abbreviations and nouns in identifiers, such as `api` or `web`.

  - 👍 Recommended: `navigation`
  - 👎 Not recommended: `navigation-api`

- Prefer common, descriptive noun phrases over abbreviations, metonymy, and syntax.

  - 👍 Recommended: `offscreen-canvas`
  - 👎 Not recommended: `offscreencanvas` (as in `OffscreenCanvas`)
  - 👍 Recommended: `grid`
  - 👎 Not recommended: `display-grid` (as in `display: grid`)

- Prefer shorter identifiers to longer identifiers, as long as they're unique and unamibguous.

  - 👍 Recommended: `has`
  - 👎 Not recommended: `has-pseudo-class`

Feature identifiers may use common suffixes (such as `-api`) to resolve naming conflicts.
