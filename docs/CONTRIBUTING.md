# Contributing to the web-features project

Thanks for your interest in contributing to this project! Before you contribute, consider the following:

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

As such, a feature has no specific size. Some features might cover single CSS properties while other features cover entire JavaScript APIs with multiple interfaces, methods, and properties. As long as a web developer would use this to achieve a specific goal, it's a feature. 

For example, the `fetch` API is a feature, the `:has()` CSS pseudo-class function too, and so is the Web Audio API.

### Feature file name and format

Features in this repository are authored as **YAML files** that are stored in the [`features`](https://github.com/web-platform-dx/web-features/tree/main/features) directory. Each file corresponds to a single feature, and contains metadata about the feature, such as its name, description, specification, or support data.

For example, the `fetch` API feature is described in the [`features/fetch.yml`](https://github.com/web-platform-dx/web-features/blob/main/features/fetch.yml) file.

The name of the file also constitutes the unique ID of the feature. In the example above, the unique ID of the feature is `fetch`.

Feature IDs must be unique as they are used in other projects to reference the feature. For example, the [browser-compat-data](https://github.com/mdn/browser-compat-data/) project references feature IDs in their compatibility data.

### Feature dist files

The YAML files that are used to author features are also used to generate _dist_ files. Dist files are also YAML files, but they end with the `.yml.dist` extension.

For example, the `fetch` feature file is `features/fetch.yml`, and its dist file is `features/fetch.yml.dist`.

You **never edit a dist file** directly. Dist files are generated from the authored YAML files, and are used at build time to generate the final data bundle that's used by other projects.

It's important to note that, even if dist files are generated artifacts, they are still checked-in to the repository. This is normal and expected. Because dist files contain the compatibility data and status information for a feature, we review them as part of the pull request process.

## Finding features to work on

In some cases, you will already have an idea for a feature to add to the repository. This could be because you've just heard about a feature on a blog post, documentation website, or other source, and noticed it was missing from this repository.

In other cases, you might want to help but don't have a specific feature in mind. That's okay too. You can find inspiration in the following places:

* [The list of issues with the **feature definition** label](https://github.com/web-platform-dx/web-features/issues?q=is%3Aopen+is%3Aissue+label%3A%22feature+definition%22).
* [The list of draft features](https://github.com/web-platform-dx/web-features/tree/main/features/draft).

A third case is if you've found a feature that's incorrectly defined. For example if its description is misleading, or you believe the browser support data is incorrect.

In any case, before starting to work on a feature, make sure it isn't already being worked on by checking the list of [pull requests with the **feature definition** label](https://github.com/web-platform-dx/web-features/pulls?q=is%3Aopen+is%3Apr+label%3A%22feature+definition%22).

## Contributing to the repository

Use the sections below to help you get started with the different ways to contribute to the web-features repository.

### Fork the repository and set up your local environment

Before being able to contribute to the repository, you need to fork it, and get accustomed to the GitHub pull request workflow:

1. Go to the [web-features repository home page](https://github.com/web-platform-dx/web-features).
1. Click **Fork** in the top-right corner of the page. GitHub creates a fork of the repository under your GitHub account.
1. Clone the forked repository locally on your computer.

To learn more about the fork and pull request process, see [Fork a repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo).

When you have the repository cloned locally, set up your local environment:

1. [Install Node.js](https://nodejs.org).
1. At a command line prompt, navigate to the root of the repository.

   `cd path/to/web-features`

1. Install the project dependencies.

   `npm install`

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

   The `group` field is used to categorize features into groups. For example, the Async Clipboard API feature is in the `Clipboard` group. Groups are maintained in the [`groups`](https://github.com/web-platform-dx/web-features/tree/main/groups) directory, and each group is a YAML file.

   * If one of the existing groups fits your feature, add the `group` field to your feature, and set it to the name of the group.
   * If none of the existing groups fit your feature, but you believe a new group should be greated, then create a new group file in the `groups` directory, and add the feature to that group.

1. Set the baseline status and browser compatibility data of the feature. This is the most important and difficult step of authoring a feature, which is documented in a separate section. See [Set the status of a feature](#set-the-status-of-a-feature).

### Create a new feature from a draft feature

To start from an existing draft feature:

1. Go through the steps in [Fork the repository and set up your local environment](#fork-the-repository-and-set-up-your-local-environment).

1. Review the existing draft features by looking at the YAML files in the [`features/draft`](https://github.com/web-platform-dx/web-features/tree/main/features/draft) directory and sub-directories.

1. Find a draft that you want to work on.

1. Move the file to the `features` directory.

1. Remove the `draft_date` field from the file.

1. Review the feature ID, name, description, and spec fields.

1. Either review, correct, or set the baseline status and browser compatibility data of the feature. This is the most important and difficult step of authoring a feature, which is documented in a separate section. See [Set the status of a feature](#set-the-status-of-a-feature).

### Set the status of a feature

TODO, what to explain here:
* npm run traverse | grep on BCD, or looking at MDN.
* listing all BCD keys vs. checking if the tag already exists in BCD.
* generating the dist file once, and checking if the overall status matches caniuse/mdn
* if discrepancies with caniuse/mdn, check which section(s) in the dist file make the difference. Doe these sections make sense?
  * do they need to be split into other features (later additions that are seen by developers are completely separate from the initial feature)?
  * do the sections make sense in this feature, but need to be "silenced" for some reason (e.g. they were added later, but are not important to be split into another feature). In which case, use compute_from
* Generate dist file again and check again.
* Anything else?
