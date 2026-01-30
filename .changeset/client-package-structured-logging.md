---
'@lsst-sqre/repertoire-client': minor
'@lsst-sqre/semaphore-client': minor
'@lsst-sqre/gafaelfawr-client': minor
'@lsst-sqre/times-square-client': minor
'squareone': patch
---

Add optional structured logger injection to client packages

- Added a `Logger` type to each client package (`repertoire-client`, `semaphore-client`, `gafaelfawr-client`, `times-square-client`) matching pino's `(obj, msg)` calling convention
- All `console.log`, `console.error`, and `console.warn` calls replaced with structured logger calls using `debug`, `error`, and `warn` levels
- Logger is accepted as an optional parameter; when omitted, a console-based default preserves existing behavior for client-side and test usage
- squareone's server-side layout now passes its pino logger to `discoveryQueryOptions`, `fetchServiceDiscovery`, and `broadcastsQueryOptions` for structured JSON output on GKE
