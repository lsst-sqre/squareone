---
'@lsst-sqre/repo-scripts': patch
---

`check-openapi-drift` now expands `${NAME}` and `${NAME:-default}` environment references in a client's `fetch-openapi` script before it reads the live spec URL, the same way `sh` expands them. With the same environment variable, the drift check compares against the host that the spec was vendored from. The periodic CI workflow sets `REPERTOIRE_HOST=data-dev.lsst.cloud` so the vendored Repertoire 3.0.0 spec is checked against data-dev until production is upgraded.
