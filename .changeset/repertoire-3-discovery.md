---
'@lsst-sqre/repertoire-client': minor
---

Support the Repertoire 3.0.0 service discovery contract while still parsing 2.x responses.

- New `EnvironmentSchema` / `Environment` for the top-level `environment` object (`name`, `label`, `title`, `title_long`, `description`, `docs_url`), which is optional so 2.x discovery still parses. `environment_name` is kept but deprecated upstream.
- UI, internal, and data services gain `title`, `docs_url`, and `required_scopes` (defaults to `[]`). Internal and data services also gain `quota_labels`, a mapping of Gafaelfawr quota labels to a `QuotaLabel` (`title`, and `internal`, which defaults to `false`). Datasets gain `obscore_config`.
- New `ServiceDiscoveryQuery` helpers:
  - `getEnvironment()` returns the environment object, or `null`.
  - `getEnvironmentName()` returns `environment.name`, falling back to `environment_name`.
  - `getUiService(name)` and `getDataService(datasetId, name)`.
  - `canAccessService(service, userScopes?)` is true when the service requires no scopes or when `userScopes` is undefined (for an anonymous visitor). Otherwise the user must hold every required scope.
  - `getQuotaLabelIndex()` maps each quota label to its service's name, title, and docs URL, plus the label's title and `internal` flag. When a label appears more than once, the first occurrence wins, and data services come before internal services.
  - `getSquareoneUrl()` and `getComanageUrl()`.
- `mockDiscovery` now uses the 3.0.0 shape. It adds the environment and the service titles, docs URLs, required scopes, and quota labels that data-dev publishes. It also adds the Argo CD, Chronograf, Kafdrop, WebDAV, COmanage, and Squareone UI services and a `prompt` dataset with no `docs_url`.
- The vendored `openapi.json` is now Repertoire 3.0.0. The `fetch-openapi` script still defaults to `data.lsst.cloud`, but a `REPERTOIRE_HOST` environment variable can override the host. For example, `REPERTOIRE_HOST=data-dev.lsst.cloud` fetches from data-dev until production runs Repertoire 3.0.
