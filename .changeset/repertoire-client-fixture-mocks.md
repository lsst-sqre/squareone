---
'@lsst-sqre/repertoire-client': minor
---

New `mockDiscoveryDataDev` and `mockDiscovery2x` mocks, alongside `mockDiscovery`, for tests and Storybook that need a whole real environment. `mockDiscoveryDataDev` is the live data-dev (`idfdev`) Repertoire 3.0.0 discovery document, and `mockDiscovery2x` is the production Repertoire 2.1.0 document, which has no `environment` object and no service titles, docs URLs, or scopes. Both are parsed through `DiscoverySchema` from the package's test fixtures.
