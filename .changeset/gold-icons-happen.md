---
'squareone': minor
---

Publish arm64 in addition to amd64 platform Docker images

We now use https://github.com/lsst-sqre/multiplatform-build-and-push to generate amd64 and arm64 images for Squareone in parallel. This is packaged in our own reusable workflow at `.github/workflows/build-squareone.yaml` for use in CI and release workflow contexts.
