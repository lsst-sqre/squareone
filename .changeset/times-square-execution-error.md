---
'@lsst-sqre/times-square-client': minor
---

Adopt the Times Square `execution_error` contract (DM-55470). `HtmlStatusSchema` and `HtmlEventSchema` now carry an optional-nullable `execution_error` object that defaults to `null`, so responses from Times Square deployments predating DM-55470 — which omit the key entirely — continue to parse. The new `ExecutionErrorSchema` parses `code` as a plain string for forward compatibility, with the codes known at build time (`timeout`, `jupyter_error`, `unknown`, `result_unavailable`) exported as the `EXECUTION_ERROR_CODES` const. Failed-state mock fixtures (`mockExecutionError`, `mockHtmlStatusFailed`, `mockHtmlEventFailed`) are available for development and testing.
