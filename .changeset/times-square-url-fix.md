---
"@lsst-sqre/repertoire-client": patch
---

Fix `getTimesSquareUrl()` to return versioned v1 API URL

Times Square is an internal service with a versioned API, not a UI service. The `getTimesSquareUrl()` method now correctly returns the v1 version URL from internal services (e.g., `https://data.lsst.cloud/times-square/api/v1`), matching the pattern used by `getGafaelfawrUrl()`.

This aligns with the actual Repertoire service discovery data where times-square is listed under `services.internal` with `versions.v1.url`.
