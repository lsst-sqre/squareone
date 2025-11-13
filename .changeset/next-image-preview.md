---
'squareone': patch
---

Enable "next" image tag for changeset release previews

The CI workflow now builds and pushes Docker images with a special "next" tag when the `changeset-release/main` branch is updated. This allows developers and managers to preview the next version before merging the "Version Packages" PR.

Previously, the workflow would only build images for the changeset-release branch without pushing them to the registry. Now:

- Images are pushed to ghcr.io with both the branch-derived tag and the "next" tag
- The "next" tag can be used to deploy and test the upcoming version in staging environments
- Other changeset-release branches (non-main) remain build-only

This improves the release preview workflow by making pre-release images easily accessible via a stable tag name.
