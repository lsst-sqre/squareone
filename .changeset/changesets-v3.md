---
"squareone": patch
---

Migrate the release machinery to Changesets CLI v3 and changesets/action v2

The `@changesets/cli` and `@changesets/changelog-github` devDependencies move to 3.0.2 and 1.0.1, and `.changeset/config.json` now points at the `@changesets/config@4.0.0` schema. The release workflow uses `changesets/action@v2`, which renames `publish`/`version` to `publish-script`/`version-script` and requires the Squareone CI app token on the new `github-token` input rather than the `GITHUB_TOKEN` environment variable.

Release commits and tags are now pushed through the GitHub API, so they are signed with GitHub's GPG key and attributed to `squareone-ci[bot]` via the app token. The workflow no longer looks up the bot's user ID or configures a Git identity by hand, and the removed `setupGitUser` input is gone with it. Dependabot can once again propose major updates of `changesets/action`.
