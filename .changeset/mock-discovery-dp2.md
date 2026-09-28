---
'@lsst-sqre/repertoire-client': patch
---

`mockDiscovery` now includes the `dp2` dataset that production service discovery publishes, with its description, a `docs_url` of `https://dp2.lsst.io`, and the same TAP, SIA, HiPS, SODA cutout, DataLink, and GMS services as `dp1`. Storybook and the development discovery route now list Data Preview 2 first, ahead of Data Preview 1. The `prompt` dataset still has no `docs_url`, as on data-dev.
