---
'@lsst-sqre/times-square-client': minor
'squareone': patch
---

Make the Times Square page-metadata fetch PR-aware so GitHub PR-preview pages load again.

`useTimesSquarePage` now accepts optional `owner`, `repo`, and `commit` coordinates on its options object. When all three are provided it fetches the PR-preview endpoint (`/v1/github-pr/{owner}/{repo}/{commit}/{path}`); otherwise it keeps the existing merged-page behavior (`/v1/github/{displayPath}`). The new parameters are optional and additive, so existing callers are unaffected. The four Squareone Times Square components now forward these coordinates from `TimesSquareUrlParametersContext`, fixing the notebook viewer, parameter form, live execution status, and download/edit links on PR-preview pages.
