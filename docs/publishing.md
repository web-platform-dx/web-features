# Publishing

## `@next` releases

The [`publish_next_` GitHub Actions workflows](https://github.com/web-platform-dx/web-features/tree/main/.github/workflows) automatically publish pre-releases on push to the main branch using the `next` [npm dist tag](https://docs.npmjs.com/adding-dist-tags-to-packages).
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
