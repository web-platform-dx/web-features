# Draft spec features

This directory is for draft features organized by spec. These features require
review before being added to web-features, as most specs define more than one
feature and many features span specs.

To help out, pick a feature and do the following:

- Follow the spec link and make a judgment whether it's reasonable to describe
  this as a single features or if needs to be split up.
- Review `baseline_low_date`, does it look plausible? If not, remove features
  from `compat_features` until the date and browser versions seem plausible. Run
  `npm run dist features/draft/spec` to regenerate dist.
- Write a description for the feature.
- Move the file into the main features/ directory and submit a PR with your
  changes.

Happy YAMLing!
