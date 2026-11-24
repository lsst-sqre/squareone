---
'@lsst-sqre/repertoire-client': minor
---

Bound and degrade server-side requests in `fetchServiceDiscovery`

Server-side, `fetchServiceDiscovery` now protects its callers from a hung or failing Repertoire on its own, including the callers that don't go through `reportingQueryFn`. In the browser it behaves as before.

- **Timeout.** A request is aborted after 5 seconds (`DEFAULT_DISCOVERY_TIMEOUT_MS`), or after the new `timeoutMs` option, and rejects with a `QueryTimeoutError` from `@lsst-sqre/api-client-core`. A `signal` passed by the caller still aborts the request as well, and an aborted request never writes the cache.
- **Last good document.** The last successfully fetched document is kept past the 5-minute cache lifetime. When an expired document's refresh fails for any reason (a timeout, a network error, an HTTP error or an invalid document), `fetchServiceDiscovery` logs a warning and returns that document instead of rejecting, however old it is. `forceRefresh` requests, aborted requests and the new `staleFallback: false` option still reject.
- **Fail fast after a timeout.** For 5 seconds after a request times out (`DISCOVERY_FAIL_FAST_WINDOW_MS`), further requests for the same URL make no request: they return the last good document, or else reject at once with that timeout error, so the lookups of one server render wait out one timeout between them rather than one each. A timeout that a caller's signal reports with a `QueryTimeoutError`, as `reportingQueryFn` does, counts too. A fast failure such as a connection reset opens no window, so `reportingQueryFn`'s retry still makes a real second request. A successful request closes the window, and `forceRefresh` ignores it.

`discoveryQueryOptions` passes `staleFallback: false`, so every failure still reaches its `reportingQueryFn` to be retried, logged and reported through `reportError`, and then falls back server-side to the last good document (or else to the empty discovery, as before). `clearDiscoveryCache()` also resets the last good document and the fail-fast window.
