---
'@lsst-sqre/gafaelfawr-client': patch
'@lsst-sqre/repertoire-client': patch
'@lsst-sqre/times-square-client': patch
---

Refresh the vendored OpenAPI specs for the Gafaelfawr, Repertoire, and Times Square clients

- `gafaelfawr-client`: re-vendored `openapi.json` at Gafaelfawr 0.1.dev1+g15b55f810 from data-dev (from 0.1.dev1+gb673b3daf). The `Quota`, `QuotaConfig`, and `TapQuota` schemas are now split into `-Input` and `-Output` variants, and `TapQuota` gained an optional nullable bytes-billed field (`bytes_billed` in responses). Two `operationId`s were renamed, the OIDC client schemas gained examples, and the spec now carries top-level tag descriptions. `QuotaSchema` strips unknown keys, so existing parsing is unchanged.
- `repertoire-client`: re-vendored `openapi.json` at Repertoire 3.1.0 (from 3.0.0). The InfluxDB database schemas gained an optional nullable `description` field. `InfluxDatabaseSchema` strips unknown keys, so existing parsing is unchanged.
- `times-square-client`: re-vendored `openapi.json` at Times Square 0.27.4.dev18+gcb2c91d92 (from 0.25.0). Only the prose description of the `html/events` endpoint changed.
