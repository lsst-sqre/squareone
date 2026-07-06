---
'@lsst-sqre/times-square-client': minor
'squareone': patch
---

Add `normalizeGitHubContents()`, a client-side normalization pass that recursively merges duplicate sibling `directory` nodes (concatenating their contents in order) in the GitHub contents tree. The pass is applied when parsing both the `/github` and `/github-pr/...` responses, keeping the sidebar correct against Times Square deployments that predate the server-side fix (lsst-sqre/times-square#140); it is idempotent against fixed servers. New mock fixtures (`mockGitHubContentsNested`, `mockGitHubContentsDuplicateDirectories`) cover multi-segment nested directories and the duplicate-directory bug shape, and the squareone dev API route for `/times-square/api/v1/github` now serves the buggy shape so the normalizer is exercised in development.
