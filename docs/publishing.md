# Publishing

## Regular releases

> [!NOTE]
> This information is for [project owners](../GOVERNANCE.md#roles-and-responsibilities).

These are the steps to publish a regular release on NPM and as a GitHub release:

1. Determine if it should be a major, minor, or patch release. The "[major version required](https://github.com/web-platform-dx/web-features/pulls?q=is%3Apr+is%3Amerged+label%3A%22major+version+required%22+sort%3Aupdated-desc)" and "[minor version required](https://github.com/web-platform-dx/web-features/pulls?q=is%3Apr+is%3Amerged+label%3A%22minor+version+required%22+sort%3Aupdated-desc)" labels should be used to support this decision.
1. Update `packages/web-features/package.json` and `packages/web-features/package-lock.json` in a PR and get review.
1. Merge the PR and draft a new release at https://github.com/web-platform-dx/web-features/releases/new.
1. Fill in the tag name `vX.Y.Z` manually as both the tag and release title.
1. For major releases, add a "Breaking Changes" section up top.
1. For minor releases, add a "What's New" section up top.
1. Click "Generate release notes".
1. Search for "<" and make sure all element names are quoted with backquotes.
1. Remove all lines from Dependabot.
1. Publish the GitHub release.

Publishing the GitHub release creates the tag. This triggers the [Publish web-features GitHub Actions workflows](https://github.com/web-platform-dx/web-features/blob/main/.github/workflows/publish_web-features.yml), uploads GitHub release artifacts and publishes the package to NPM.

## `@next` releases

The [Publish web-features@next GitHub Actions workflows](https://github.com/web-platform-dx/web-features/blob/main/.github/workflows/publish_next_web-features.yml) automatically publish pre-releases on push to the main branch using the `next` [npm dist tag](https://docs.npmjs.com/adding-dist-tags-to-packages).
You can install these prereleases using a command such as `npm install web-features@next`.

## Secrets

> [!NOTE]
> This information is for [project owners](../GOVERNANCE.md#roles-and-responsibilities).

Publishing requires the `NPM_TOKEN` repository secret (set via _Settings_ → _Secrets and variables_ → _Actions_).
If you're replacing this token, then use the following settings:

| Setting                          | Value                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Token type                       | _Granular Access Token_                                                                                    |
| Expiration                       | The first day of the next quarter (1 January, 1 April, 1 July, or 1 October) or the first weekday after it |
| Packages and scopes permsissions | _Read and write_                                                                                           |
| Select packages                  | _Only select packages and scopes_                                                                          |
| Select packages and scopes       | `compute-baseline` and `web-features`                                                                      |
| Organizations                    | _No access_                                                                                                |
