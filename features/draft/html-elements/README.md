# Draft HTML element features

This directory is for HTML elements that are candidates for web-features, but
which require a bit of work before adding.

To help out, pick a feature and do the following:

- Follow the spec link and make a judgment whether the element makes sense as
  its own feature or if it should be grouped with other features.
- Review `baseline_low_date`, does it look plausible? If not, remove features
  from `compat_features` until the date and browser versions seem plausible.
  Run `npm run dist features/draft/html-elements/tag.yml` to regenerate dist.
- Write a description for the feature.
- Move the file into the main features/ directory and submit a PR with your
  changes.

Happy YAMLing!
