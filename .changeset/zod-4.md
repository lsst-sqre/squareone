---
'@lsst-sqre/api-client-core': minor
'@lsst-sqre/gafaelfawr-client': minor
'@lsst-sqre/repertoire-client': minor
'@lsst-sqre/semaphore-client': minor
'@lsst-sqre/times-square-client': minor
'@lsst-sqre/file-factory': minor
---

Update zod from 3 to 4. The exported schemas and inferred types are unchanged, but `ZodError` instances thrown on API contract drift now have zod 4's shape. Record schemas declare their string keys explicitly, and ISO datetime and URL fields use the top-level `z.iso.datetime()` and `z.url()` validators. The file-factory lifecycle hooks are validated with `z.custom()` rather than the removed `z.function().args().returns()` chain, and nested config sections use `.prefault({})` so their inner defaults still apply. The test-data generators in the client packages now use `zod-schema-faker`, which supports zod 4, in place of `@anatine/zod-mock`.
