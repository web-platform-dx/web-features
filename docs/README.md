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

- Prefer frequently-used qualifiers in parentheses at the end of the name.

  - 👍 Recommended: Arrays (initial support)
  - 👎 Not recommended: Initial support for arrays

- Prefer shorter names to longer names, as long as they're unique and unambiguous.

  - 👍 Recommended: `:has()`
  - 👎 Not recommended: `:has()` pseudo-class
  - 👍 Recommended: `<dialog>`
  - 👎 Not recommended: `<dialog>` element

### Identifiers

Feature identifiers must contain only lowercase alphanumeric characters (`a`-`z` and `0-9`) plus the `-` character (hyphen or minus sign) as a word separator.

The identifier should match the name, with these additional guidelines:

- Prefer shorter identifiers to longer identifiers, by avoiding common qualifiers and repeated words.

  - 👍 Recommended: `aborting`
  - 👎 Not recommended: `abort-controller-and-abort-signal`
  - 👍 Recommended: `arrays`
  - 👎 Not recommended: `arrays-initial-support`
  - 👍 Recommended: `fullscreen`
  - 👎 Not recommended: `fullscreen-api`
  - 👍 Recommended: `user-pseudos`
  - 👎 Not recommended: `user-valid-and-user-invalid`

### Descriptions

* Describe, in the active voice, what a feature does or is.
  Think about how developers will use it, not abstract technology relationships.
  Start with a template like this:

  - `The <property> <sets> the <noun>.`
  - `The <interface> <verbs> the <noun>.`
  - `The <type> represents <nouns>.`
  - `<format> is a <kind> or <variety>`.

* Description text must stand alone.
  It should not refer to text, images, or other content outside the short description.
  Try reading the sentence aloud.
  Does it still make sense without mentioning the name or ID?

* Start descriptions with words that are distinct to the feature.
  For example, prefer "The `some-prop` CSS property…" and avoid "The CSS property `some-prop`…."

* Avoid circular descriptions.
  For example, prefer "The `filter()` method returns the items…" over "The `filter()` method filters the items…."

* Never mention support or standards status.
  This information *will* go out of date and sooner than you think.

* For every rule, there's a counterexample.
  Use your best judgement before writing something absurd.

* See the [word and phrase list](#word-and-phrase-list) for specific guidelines.

#### Word and phrase list

##### allows

OK in usage such as "allows you to…."
Avoid where there is no named actor, as in "the feature allows magic to happen."

You can often omit it with gerunds.
For example, prefer "The widget sends…" over "The widget allows sending…."

##### also known as

Use a sentence at the end of the description, such as "Also known as AKA or an alias."

##### defines

Avoid.
See [sets](#sets).

##### determines

Avoid.
See [sets](#sets).

##### elements

Avoid "element" in reference to things that are not HTML elements.
For example, an array of objects has "items", not "elements."

##### enables

Avoid, except in the sense of to turn on or activate.
See [allows](#allows).

##### for example

Don't use it as a coordinating conjunction; start a new sentence instead.
For example, this is an example.

##### is used to

Omit "is used" where there's no loss in meaning.
For example, prefer "The feature reads…" over "The feature is used to read…"

##### provides

Avoid, especially with gerunds.
For example, prefer the "The feature writes to…" over "The feature provides writing to…."

##### sets

Prefer this over multisyllabic alternatives, such as "defines", "determines", or "specifies".
Use "The property sets…" but never "The property defines…."

##### specifies

Avoid.
See [sets](#sets).
