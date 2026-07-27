---
'@lsst-sqre/repertoire-client': patch
'@lsst-sqre/times-square-client': patch
---

Refresh the vendored OpenAPI specs for the Repertoire and Times Square clients

- `repertoire-client`: re-vendored `openapi.json` at Repertoire 2.1.0 (from 2.0.0). The only API-surface change is the `operationId` on `/api/registry`, which is now `get_oai_api_registry_get` for both the GET and POST operations. No schemas changed, so the Zod schemas and types are unaffected.
- `times-square-client`: re-vendored `openapi.json` at Times Square 0.24.2.dev9+g3ee2b2a55 (from 0.23.1.dev24+g576ef1393). The `ValidationError` schema gained two optional fields, `input` and `ctx`; neither is required, and `ValidationErrorSchema` strips unknown keys, so existing parsing is unchanged.
