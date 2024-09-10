# Contributing to the web-features project

Thanks for your interest in contributing to this project!
Before you contribute, consider the following:

* Help us create a kind, welcoming, and productive project.
 
  You can do this in part by following the [W3C Code of Ethics and Professional Conduct](https://www.w3.org/Consortium/cepc/), which governs conduct on this project.

* All contributions to this project are licensed under the terms of the Apache License, Version 2.0.
 
  [Read `LICENSE.txt` for details](../LICENSE.txt).

There are multiple ways to contribute to the web-features repository, such as:

* Adding a missing feature to the repository, from scratch.
* Adding a missing feature to the repository, by updating a feature that was already drafted.
* Updating an existing feature, for example to change its name, description, support data, or other fields.
* Reviewing a pull request that was submitted by someone else, to check if the feature is correctly authored.

In any case, **thank you** for wanting to help. This document will guide you through the process of contributing to the web-features repository.

Also consider joining the [WebDX Community Group](https://www.w3.org/community/webdx/).

## What makes a feature

Think of features as individual components of the web platform that web developers can use to achieve specific tasks.

As such, a feature has no specific size. A feature might cover a single CSS property, an entire JavaScript APIs with multiple interfaces, methods, and properties, or a combination of CSS properties, HTML elements, and JavaScript APIs. As long as a web developer would use the feature to achieve a specific goal, it's a feature.

For example, the `fetch()` API is a feature, the `:has()` CSS pseudo-class function too, and so is the Web Audio API.

For the time being, this repository focuses only on features that are implemented in some browser and that are already documented on MDN.

### Hints for distinguishing features

Sometimes it can be hard to tell whether something (like an HTML attribute or JavaScript method) is a distinct feature or part of another feature.
Here are some questions to ask yourself when deciding whether something is a distinct feature of the web platform:

- Is there evidence that developers recognize it as a feature?
  Blog posts, Stack Overflow questions, and social media posts by developers about the feature are good places to learn whether developers see something as part of a category or as standing alone
  (they're also a good source of other information, such as a name for the feature).

- Do existing publications already describe this as a distinct feature?
  For example, an original Can I Use entry (or request for one on [Fyrd/caniuse](https://github.com/Fyrd/caniuse/issues)) is a good sign that developers will recognize this as a feature.
  Articles in developer-audience publications (such as CSS-Tricks, DEV.to, and sometimes MDN) are also helpful indicators.

- Do you _expect_ developers to recognize it as a feature?
  Very new features are harder to sort out because developers don't know about them already.
  In such cases, you have to make educated guesses.
  Sometimes you can use prior features' development and specification process to make good guesses.
  For example, TC39 proposals often emerge as distinct features, while CSS specifications often contain several distinct but related features or incremental additions to existing features.
  Sometimes you may need to talk to developers or subject matter experts before making a decision.

Creating features is more art than science.
You won't always get it right.
That's OK!
Features can be renamed, split, or merged later.

### Feature file name and format

Features in this repository are authored as **YAML files** that are stored in the [`features`](../features) directory. Each file corresponds to a single feature, and contains metadata about the feature, such as its name, description, specification, or support data.

For example, the `fetch()` API feature is described in the [`features/fetch.yml`](https://github.com/web-platform-dx/web-features/blob/main/features/fetch.yml) file.

The name of the file also constitutes the unique ID of the feature. In the example above, the unique ID of the feature is `fetch`.

Feature IDs must be unique as they are used in other projects to reference the feature. For example, the [browser-compat-data](https://github.com/mdn/browser-compat-data/) project references feature IDs in their compatibility data.

### Fields in a feature file

This table lists the fields that can be found in a feature file, and provides a brief description of each field:

| Field | Description | Type | Mandatory |
|---|---|---|---|
| `name` | The name of the feature. | String | Yes |
| `description` | A short description of the feature. | Markdown-formatted string | Yes |
| `spec` | One or more specification URLs for this feature. | String, or array of strings | Yes |
| `group` | An optional group, or list of groups that this feature belongs to. See the definition of groups under [Create a new feature from scratch](#create-a-new-feature-from-scratch). | String, or array of strings | No |
| `caniuse` | The feature's ID on the [Can I Use](https://caniuse.com/) website. | String | No |
| `compat_features` | @mdn/browser-compat-data (BCD) entry keys (e.g., `css.properties.background-color`) that make up this feature. If `compat_features` is not set in `<feature-id>.yml`, the `dist` script will populate `compat_features` in `<feature-id>.yml.dist` with BCD entry keys tagged with `web-features:<feature-id>` in BCD, if any exist. | Array of strings | No |
| `status` | An optional object which describes whether the feature is considered baseline, when it achieved this baseline status, and the version number of supported browsers. In the majority of cases, this is calculated from the `compat_features` list or from browser-compat-data entries directly, and therefore not needed. | Object | No |
| `status.compute_from` | An optional field, within the `status` object, to allows you to specify which BCD keys should the overall feature status be computed from. This is useful to list all BCD keys that are related to a feature, but only consider some of them in the baseline status calculation. | String, or array of strings | No |

### Feature dist files

The YAML files that are used to author features are also used to generate _dist_ files. The term _dist_ is short for distribution.

Dist files are also YAML files, but they end with the `.yml.dist` extension. Dist files are part of the data that we publish.

For example, the `fetch` feature file is `features/fetch.yml`, and its dist file is `features/fetch.yml.dist`.

You **never edit a dist file** directly. Dist files are generated from the authored YAML files, and are used at build time to generate the final data bundle that's used by other projects.

To generate a dist file, run `npm run dist` command.
Do this when creating or updating a feature.

Some fields, such as `status` and `compat_features`, may appear in either the authored YAML file, the generated dist file, or both.
The contents of the authored YAML file overrules all other implicit sources of data.
For example, if you set `compat_features` in an authored YAML file, then the corresponding @mdn/browser-compat-data tag is ignored.
Likewise, setting a `status` value in an authored YAML file overrules a status generated from `compat_features` or tag.

If the dist file contains only an empty object (`{}`) it means that there is no generated data in addition to the source YAML.
To learn more, see [Set the status of a feature](#set-the-status-of-a-feature), below.

> [!Important]
> Even if dist files are generated artifacts, they are still checked-in to the repository. This is normal and expected. Because dist files contain the compatibility data and status information for a feature, we review them as part of the pull request process.

## Finding features to work on

In some cases, you will already have an idea for a feature to add to the repository. This could be because you've just heard about a feature on a blog post, documentation website, or other source, and noticed it was missing from this repository.

In other cases, you might want to help but don't have a specific feature in mind. That's okay too. You can find inspiration in the following places:

* [The list of issues with the **feature definition** label](https://github.com/web-platform-dx/web-features/issues?q=is%3Aopen+is%3Aissue+label%3A%22feature+definition%22).
* [The list of draft features](../features/draft).

A third case is if you've found a feature that's incorrectly defined. For example if its description is misleading, or you believe the browser support data is incorrect.

In any case, before starting to work on a feature, make sure it isn't already being worked on by checking the list of [pull requests with the **feature definition** label](https://github.com/web-platform-dx/web-features/pulls?q=is%3Aopen+is%3Apr+label%3A%22feature+definition%22).

## Contributing features to the repository

Use the sections below to help you get started with the different ways to contribute to the web-features repository.

### Fork the repository and set up your local environment

Before being able to contribute to the repository, you need to fork it, and get accustomed to the GitHub pull request workflow:

1. Go to the [web-features repository home page](https://github.com/web-platform-dx/web-features).
1. Click **Fork** in the top-right corner of the page. GitHub creates a fork of the repository under your GitHub account.
1. Clone the forked repository locally on your computer.

To learn more about the fork and pull request process, see [Fork a repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo).

When you have the repository cloned locally, set up your local environment:

1. [Install Node.js](https://nodejs.org).
   See [`.nvmrc`](../.nvmrc) for the minimum required version.

1. At a command line prompt, navigate to the root of the repository:

   `cd path/to/web-features`

1. Install the project dependencies:

   `npm install`

1. Create a new Git branch to track your work:

   `git checkout -b <your branch name>`

> [!TIP]
> If your editor supports it, turn on automatic code formatting with Prettier.
> Read Prettier's [Editor Integration](https://prettier.io/docs/en/editors) documentation for more information.

### Create a new feature from scratch

To create a new feature from scratch:

1. Go through the steps in [Fork the repository and set up your local environment](#fork-the-repository-and-set-up-your-local-environment).

1. Decide what the unique ID for your new feature should be. To help you, check the [Identifiers](./guidelines.md#identifiers) section of the feature guidelines.

1. Create a file in the `features` directory with the name of your feature ID, and the `.yml` extension. For example, if your feature ID is `my-feature`, create a file named `features/my-feature.yml`.

1. Open the file in your favorite text editor, and add the following minimum content:

   ```yaml
   name: "My feature"
   description: "A short description of the feature."
   spec: https://urlofthespec.com
   ```

   For guidance, see the [Names](./guidelines.md#names) and [Descriptions](./guidelines.md#descriptions) sections of the feature guidelines.

1. Optionally add a `group` field to the feature.

   The `group` field is used to categorize features into groups. For example, the Async Clipboard API feature is in the `clipboard` group. Groups are maintained in the [`groups`](../groups) directory, and each group is a YAML file. The name of the file defines the unique ID of a group.

   * If one of the existing groups fits your feature, add the `group` field to your feature, and set it to the ID of the group.
   * If none of the existing groups fit your feature, but you believe a new group should be created, then create a new group file in the `groups` directory, then add the `group` field to your feature set to the ID of the new group.

1. Set the baseline status and browser compatibility data of the feature. This is the most important and difficult step of authoring a feature, which is documented in a separate section. See [Set the status of a feature](#set-the-status-of-a-feature).

### Create a new feature from a draft feature

To start from an existing draft feature:

1. Go through the steps in [Fork the repository and set up your local environment](#fork-the-repository-and-set-up-your-local-environment).

1. Review the existing draft features by looking at the YAML files in the [`features/draft`](../features/draft) directory and sub-directories.

1. Find a draft that you want to work on.

1. Move the `.yml` and `.yml.dist` files to the `features` directory.

1. Remove the `draft_date` field from the `.yml` file.

1. Review the feature ID, name, and spec fields for correctness.

1. Write a new description for the feature, making sure it follows the [Descriptions](./guidelines.md#descriptions) guidelines, and is consistent with other feature descriptions in the repository.

1. Either review, correct, or set the baseline status and browser compatibility data of the feature. This is the most important and difficult step of authoring a feature, which is documented in a separate section. See [Set the status of a feature](#set-the-status-of-a-feature).

### Set the status of a feature

After you've prepared your new feature file with its unique ID, `name`, `description`, and `spec` fields, you must provide the necessary information for this feature's status to be calculated.

A feature's status consists of:

* Whether the feature is considered baseline or not, and which level of baseline it has achieved:

  * Baseline _low_ means that the feature is now available on all browsers listed in the core browser set.
  * Baseline _high_ means that the feature has been available on all browsers listed in the core browser set for long enough that it's considered _widely_ available.

  For more information about baseline and the actual definition of _long enough_, see [Baseline](./baseline.md).

* If the feature is considered baseline, the dates at which it has achieved the low and high levels.

* The browser support data for this feature, which consists of the version number for each of the browsers that support the feature.

#### Understand where browser support data comes from

The browser support data for your feature is what determines its baseline status. For example, if your feature is supported on Chrome 66, Chrome Android 66, Edge 79, Firefox 76, Firefox Android 79, Safari 12.1, and Safari iOS 12.2, then it's baseline high, because those versions have been released long enough ago.

The browser support data that we use comes from the [browser-compat-data project](https://github.com/mdn/browser-compat-data/) (BCD), which you need to understand before continuing to set the status of your feature.

BCD contains browser support data for individual constituent of web features, such as CSS properties, JavaScript statements, HTML elements and attributes, DOM interfaces, methods, and events.
For example, BCD contains the list of browsers, and their versions, that support the [`grid-template-rows` CSS property](https://github.com/mdn/browser-compat-data/blob/main/css/properties/grid-template-rows.json), which is a constituent of the [grid](https://github.com/web-platform-dx/web-features/blob/main/features/grid.yml) feature.

We refer to each entry that contains browser support data in BCD as a _BCD key_. In the `grid-template-rows` example, the BCD key is `css.properties.grid-template-rows`.

Features in the web-features project are associated with one or more BCD keys. For example, the grid feature is associated with multiple BCD keys, which together, describe the overall grid feature: `css.properties.display.grid`, `css.properties.display.inline-grid`, `css.properties.grid`, `css.properties.grid-area`, and more.

#### Associate BCD keys with your feature

To set the status of your new feature, you must associate your feature with one or more BCD keys. There are two cases for associating your feature to BCD keys:

* Either BCD already defines references to your new feature. In this case, you don't need to explicitly list the BCD keys that your feature depends on.

  For example, the [grid](https://github.com/web-platform-dx/web-features/blob/main/features/grid.yml) feature doesn't list any BCD keys, because the BCD project already maps the right BCD keys to the `grid` web-features ID. See the [`web-features:grid` search results](https://github.com/search?q=repo%3Amdn%2Fbrowser-compat-data%20%22web-features%3Agrid%22&type=code) in BCD.

  Here is the grid feature YAML file content, showing that no BCD keys appear in the file:

  ```yaml
  name: Grid
  description: CSS Grid is a two-dimensional layout system, which lays content out in rows and columns.
  spec: https://drafts.csswg.org/css-grid-3/
  group: grid
  caniuse: css-grid
  ```

  You should always check first if BCD doesn't already map to your feature ID by running `npm run dist` and checking if the resulting dist file contains supported browser versions.

* Or BCD doesn't already reference your new feature. In this case, you need to list the BCD keys that make up your feature under the `compat_features` field of your new feature file.

  For example, here are the first few lines of the `@counter-style` feature, which defines a list of BCD keys:

  ```yaml
  name: "@counter-style"
  description: The `@counter-style` CSS at-rule defines custom counter styles for list items. For example, you can use a sequence of specific symbols instead of numbers for an ordered list.
  spec: https://drafts.csswg.org/css-counter-styles-3/
  caniuse: css-at-counter-style
  compat_features:
    - css.at-rules.counter-style
    - css.at-rules.counter-style.additive-symbols
    - css.at-rules.counter-style.fallback
    - css.at-rules.counter-style.negative
   ```

  To identify the BCD keys that you need, check the browser compatibility tables displayed at the end of the MDN pages that document your new feature, and then search the BCD source code for the names that appear in the table.

  You can also use the `npm run traverse | grep -i <keyword>` command in BCD to list all BCD keys that match a certain keyword.

#### Generate and check the dist file

To generate your feature's dist file, once your feature is associated with one or more BCD keys:

1. Run the command `npm run dist`.
   Optionally, run `npm run dist -- features/<feature-id>.yml` to regenerate only your feature's dist file.

1. Check that a new file, named after your feature ID, and with the `.yml.dist` file extension exists, and open the file.

1. Check that the data in the dist file is correct. In particular, verify that the data is consistent with what developers would find when searching for the same feature on caniuse.com or MDN.

   * Check the `baseline` status. If the feature isn't yet supported in all browsers of the core browsers set, it should be `false`. If the feature is supported on all browsers, it should either be `low` or `high`, depending on how long has passed.
   * Check the `baseline_low_date`. Does it seem like the feature should be older? Newer? Or just right?
   * Check that the browser versions listed under `support` match what caniuse.com and MDN document too.

#### Fix data discrepancies in your feature's dist file

The most likely reason for the data in your new feature's dist file to be incorrect is that your feature is associated with too many BCD keys, or with the wrong BCD keys. BCD keys describe all constituents of a feature, whether they are vital to the feature, or later additions to it. For example, developers have been able to use the Web Audio API for many years even if the AudioWorklet or OfflineAudioContext APIs were added later, and only recently became baseline.

You might be faced with the following scenarios:

* Your feature's overall status is too old (e.g., it's a new feature, but it's being reported as long-established). In this case, you might have missing BCD keys. Check that you've covering the complete feature by looking for missing interfaces, CSS property values, and so on.
* Your feature's overall status is too young (e.g., it's a long-established feature, but it's being reported as newly available). In this case, you might have BCD keys that correspond to later additions which are holding the feature back unfairly.\
* Your feature's overall status and individual BCD keys are yielding incorrect results. In this case, the underlying BCD data might have caveats or errors. Check the data in the [browser-compat-data](https://github.com/mdn/browser-compat-data/) repository for any caveats such as features behind prefixes or flags, or partial implementations.

To fix data discrepancies in your dist file, open the dist file and, under `compat_features`, review each individual section. Each section corresponds to a group of BCD keys that have the same baseline and support status.

Look for the feature's entrypoint in the dist file. The entrypoint of a feature is the property, interface, method, or other constituent part of the feature which web developers use first. For example, the Web Audio API feature has the `AudioContext` interface as its entrypoint. Before doing anything else, developers will first instantiate an `AudioContext` object by doing `const audioContext = new AudioContext()`.

If your feature's entrypoint doesn't have the same status as the overall feature, use the `compute_from` field in your feature file to flag the BCD key (or keys) that represent the minimum viable set of constituent parts of a feature that make it usable.

### Create a GitHub Pull Request to review and merge your changes

To get your changes reviewed and, eventually, merged:

1. Commit all of your local changes:

   `git commit -a -m "Description of your changes"`

1. Push your new branch to your forked repository:

   `git push origin <name of your branch>`

1. At https://github.com/web-platform-dx/web-features/pulls, open a new Pull Request.
