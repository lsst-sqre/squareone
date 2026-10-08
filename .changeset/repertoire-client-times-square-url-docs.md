---
'@lsst-sqre/repertoire-client': patch
---

Correct the documentation of `getTimesSquareUrl()`: the Times Square service's base `url` (from `getInternalServiceUrl('times-square')`) is the unversioned API root, such as `https://data.lsst.cloud/times-square/api`, and `getTimesSquareUrl()` returns the `v1` endpoint URL under it. Its behavior is unchanged.
