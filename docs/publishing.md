# Publishing releases

## Announcements

web-features uses a GitHub Discussions thread to give notice of breaking changes and other major changes to interested web-features consumers.

If you want to receive these announcements, subscribe to the [Upcoming changes](https://github.com/web-platform-dx/web-features/discussions/2613) announcements thread or to all discussions through the repository's _Watch_ menu.

> [!NOTE]
> The remainder of this section is for [project owners](../GOVERNANCE.md#roles-and-responsibilities).

If you're planning to publish a breaking release (see [Regular releases](#regular-releases)) in the next two weeks, then post a message to the [Upcoming changes](https://github.com/web-platform-dx/web-features/discussions/2613) announcements thread.
Include a summary of the expected changes, citing relevant issues and pull requests.

Note that an announcement is not a substitute for seeking consumer feedback early in the design and implementation process.
Announcements should not provoke surprising responses from consumers.

## Regular releases

> [!NOTE]
> This section is for [project owners](../GOVERNANCE.md#roles-and-responsibilities).

These are the steps to publish a regular release on npm and as a GitHub release.
Typically, a maintainer follows these steps shortly after merging a Dependabot PR that upgrades `@mdn/browser-compat-data`.

> [!TIP]
> 
> Running the stats for the `main` branch and previous release can help you determine the next release's version number and writing the release notes.
> Run these commands to get stats for the previous release:
> 
> ```sh
> $ PREVIOUS_RELEASE_TAG=$(gh release view --json tagName --jq .tagName)
> $ git fetch --tags && git checkout "$PREVIOUS_RELEASE_TAG" && npm install && npx tsx ./scripts/stats.ts
> ```
> Run these commands to get stats for the `main` branch:
> 
> ```sh
> $ git fetch origin main && git checkout origin/main && npm install && npx tsx ./scripts/stats.ts
> ```

To publish a release:

1. Determine if it should be a major, minor, or patch release.

   A major version is required for releases when:

   - The schema changes such that types have incompatibly narrowed, widened, or otherwise changed (for example, a string value now accepts an array of strings or an ID has become a URL). Changes to `data.schema.json` often indicates a major or minor version is required.
   - A group or feature ID is removed, or any other previously valid references becomes undefined.

   A minor version is required for releases that contain only additions, such as new features or new properties on existing types.

   Patch versions are required for releases that contain only routine data changes, such as updates to `compat_features` arrays or `support` objects.

   Check "[major version required][major-version]" and "[minor version required][minor-version]" labels for pull requests or issues that require versioning.

1. Trigger the [Prepare web-features release workflow](https://github.com/web-platform-dx/web-features/actions/workflows/prepare_release.yml).

   1. Click the **Run workflow** dropdown.
   1. Choose the semver level.
   1. Click the **Run workflow** button.

   When the workflow finishes, your review is requested on a new release pull request.

1. Review the PR.

   1. Close and reopen the release PR, to allow the tests to run.
   1. Review and approve the changes.
   1. When you're ready to complete the remaining steps, merge the PR.
      To avoid re-doing release prep (such as having to change the semver level), don't delay any of the remaining steps after merging.

1. Create the GitHub release.

   1. Go to https://github.com/web-platform-dx/web-features/releases/new to start a new draft release.
   1. Create a new tag in the pattern `vX.Y.Z`.
   1. Fill in the release title `vX.Y.Z`.
   1. For minor releases, add a `## What's New` section to the top of the release notes, before all other sections.

      1. In this section, add a line `* X features`, where `X` is the number of features new in this release.
      1. In this section, add a line `* Y% coverage of BCD`, where `Y` is the coverage percentage for this release.

   1. For major releases, add a `## Breaking Changes` section to the top of the release notes, before all other sections.
   1. Click **Generate release notes**.
   1. In the release description, find unescaped `<` characters and make sure that HTML elements are enclosed with backticks.

      This regular expression can help:

      ```regex
      / (?<!`)<(.*?)> /
      ```

   1. Remove all generated lines for:
   
      - `Update draft features by @github-actions`
      - Dependabot PRs except `@mdn/browser-compat-data` upgrades
      - `📦 Release web-features`

   1. Append this message to the end of the release notes:

      ```markdown
      Subscribe to the [Upcoming changes](https://github.com/web-platform-dx/web-features/discussions/2613) announcements thread for news about upcoming releases, such as breaking changes or major features.
      ```

   1. Click **Publish release**.

   Publishing the GitHub release creates the tag. This triggers the [Publish web-features GitHub Actions workflows](https://github.com/web-platform-dx/web-features/blob/main/.github/workflows/publish_web-features.yml), uploads GitHub release artifacts and publishes the package to npm.

1. Remove the "[major version required][major-version]" and "[minor version required][minor-version]" labels from any pull requests that were included in the release.

1. (_Optional_) If this release contained schema changes, notify highly-visible downstream consumers, such as Can I Use (@Fyrd), MDN (@LeoMcA), or webstatus.dev (@jcscottiii).

1. Post a message to the WebDX Matrix chat to announce the release.

Congratulations, you've released web-features. 🎉

[major-version]: https://github.com/web-platform-dx/web-features/pulls?q=is%3Apr+is%3Amerged+label%3A%22major+version+required%22+sort%3Aupdated-desc
[minor-version]: https://github.com/web-platform-dx/web-features/pulls?q=is%3Apr+is%3Amerged+label%3A%22minor+version+required%22+sort%3Aupdated-desc

## `@next` releases

The [Publish web-features@next GitHub Actions workflows](https://github.com/web-platform-dx/web-features/blob/main/.github/workflows/publish_next_web-features.yml) automatically publish pre-releases on push to the main branch using the `next` [npm dist tag](https://docs.npmjs.com/adding-dist-tags-to-packages).
You can install these prereleases using a command such as `npm install web-features@next`.

## Secrets

> [!NOTE]
> This section is for [project owners](../GOVERNANCE.md#roles-and-responsibilities).

Publishing requires the `NPM_TOKEN` repository secret.

Set the secret by running `gh secret set --repo=web-platform-dx/web-features NPM_TOKEN`,
which prompts you to paste the secret,
or via the repository settings (_Settings_ → _Secrets and variables_ → _Actions_).

If you're replacing this token, then use the following settings:

| Setting                         | Value                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Token type                      | _Granular Access Token_                                                                                    |
| Expiration                      | The first day of the next quarter (1 January, 1 April, 1 July, or 1 October) or the first weekday after it |
| Packages and scopes permissions | _Read and write_                                                                                           |
| Select packages                 | _Only select packages and scopes_                                                                          |
| Select packages and scopes      | `compute-baseline` and `web-features`                                                                      |
| Organizations                   | _No access_                                                                                                |
