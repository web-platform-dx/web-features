# Pull request and issue management

## Merging pull requests

> [!NOTE]
> This information is for [project peers and owners](../GOVERNANCE.md#roles-and-responsibilities).

If a pull request has been approved and tests are passing, then you can merge it.
Follow these steps to merge:

1. Make sure you **should** merge this pull request.
   In general, only merge pull requests you are already familiar with, either as an author or reviewer.

1. Make sure **you** should merge this pull request.
   Some changes—most notably, feature removals, tooling and policy changes, and schema changes—require an owner to merge.
   See [the privileges and responsibilities matrix](../GOVERNANCE.md#privileges-and-responsibilities-matrix) for more information.

1. Make sure there are no explicit blockers to merging.
   Blockers include:

   - The pull request has the [blocked label](https://github.com/web-platform-dx/web-features/pulls?q=is%3Aopen+is%3Apr+label%3Ablocked).
   - A reviewer asked to re-review before merging or has requested changes that have not been addressed with a commit or comment.
   - The author explicitly asked to delay merging.
   - The author explicitly asked for review from all requested reviewers (the presumption is at least one but not all).

   If a blocker no longer applies, remove the label or [dismiss the stale review](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/dismissing-a-pull-request-review).

1. If the pull request might require a Semantic Versioning MAJOR or MINOR release, then add the [minor version required](https://github.com/web-platform-dx/web-features/labels/minor%20version%20required) or [major version required](https://github.com/web-platform-dx/web-features/labels/major%20version%20required) label.

1. Click the **Squash and merge** button, then prepare the commit message.

   Clean up the subject and message fields so they make sense as a single unit.
   For example, delete boilerplate messages about applying changes from code review.
   Often an imperative-noun subject, such as "Add example feature", is sufficient.

1. When you're ready to commit the changes, click **Confirm squash and merge**.
