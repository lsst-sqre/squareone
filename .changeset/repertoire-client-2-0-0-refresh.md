---
'@lsst-sqre/repertoire-client': minor
---

Refresh the vendored Repertoire client to match live Repertoire 2.0.0

- Re-vendored `openapi.json` at 2.0.0: dropped the now-excluded `ivoa_standard_id` from `ApiVersion`, added `environment_name` to `Discovery`, and added the `local` flag to the InfluxDB database models.
- Reconciled the Zod schemas: `DiscoverySchema` now accepts the optional `environment_name`, `InfluxDatabaseSchema` gained `local` (defaults to `false` when omitted, matching the server's `exclude_defaults` serialization), and `ApiVersionSchema` dropped `ivoa_standard_id` (removed from `ApiVersion` in 2.0.0; unknown keys are stripped by default, so legacy payloads still parse).
- Rewrote `mockDiscovery` to mirror the live `dp1`/`dp02`/`dp03` datasets with real service and semantic version keys (`sia-query-2.0`, `soda-sync-1.0`, `soda-async-1.0`, `hips-list-1.0`, `tables`, `gms-search-1.0`) plus the `datalink`/`gms` services. The mock now matches live fidelity: `dp03` is catalog-only (no `cutout`), cutout version URLs are not dataset-scoped (`/api/cutout/sync`, `/api/cutout/jobs`), and `datalink` carries its `openapi` URL and `datalink-links-1.1` version. Internal services (`gafaelfawr`, `times-square`) keep their `v1` version key so `getGafaelfawrUrl()`/`getTimesSquareUrl()` and the Header nav / settings helpers still resolve.
