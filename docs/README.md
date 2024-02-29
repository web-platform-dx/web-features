# Project documentation

## Feature guidelines

### Names

Feature authors should (in descending order of priority):

- Prefer names to known to be in widespread use by web developers.
  Favor describing things as they are most-widely known, even if it's not the most technically correct option.

  - 👍 Recommended: JavaScript
  - 👎 Not recommended: ECMAScript
  - 👍 Recommended: Declarative shadow DOM
  - 👎 Not recommended: `shadowrootmode` attribute

- Avoid prefixes that mark a feature as specific to a technology, such as CSS, HTML, or JavaScript.
  Features can and do cross such boundaries.

  - 👍 Recommended: Container queries
  - 👎 Not recommended: CSS container queries
  - 👍 Recommended: `<dialog>`
  - 👎 Not recommended: HTML `<dialog>`

- Avoid frequently-used abbreviations and nouns, such as API and Web.

  - 👍 Recommended: Async clipboard
  - 👎 Not recommended: Async clipboard API
  - 👍 Recommended: Workers
  - 👎 Not recommended: Web workers

- Prefer common, descriptive noun phrases over abbreviations, metonymy, and syntax.

  - 👍 Recommended: Offscreen canvas
  - 👎 Not recommended: `OffscreenCanvas`
  - 👍 Recommended: Grid
  - 👎 Not recommended: `display: grid`

- Prefer shorter names to longer names, as long as they're unique and unambiguous.

  - 👍 Recommended: `:has()`
  - 👎 Not recommended: `:has()` pseudo-class
  - 👍 Recommended: `<dialog>`
  - 👎 Not recommended: `<dialog>` element

### Identifiers

Feature identifiers must contain only lowercase alphanumeric characters (`a`-`z` and `0-9`) plus the `-` character (hyphen or minus sign) as a word separator.

The identifier should match the name, with these additional guidelines:

- Prefer shorter identifiers to longer identifiers, by avoiding common and repeated words.

  - 👍 Recommended: `aborting`
  - 👎 Not recommended: `abort-controller-and-abort-signal`
  - 👍 Recommended: `fullscreen`
  - 👎 Not recommended: `fullscreen-api`
  - 👍 Recommended: `user-pseudos`
  - 👎 Not recommended: `user-valid-and-user-invalid`
