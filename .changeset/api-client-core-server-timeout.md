---
'@lsst-sqre/api-client-core': minor
---

Time out server-side attempts in `reportingQueryFn`

Server-side, each attempt of a `reportingQueryFn` query function now has a timeout: 5 seconds by default (exported as `DEFAULT_SERVER_TIMEOUT_MS`), or the new `timeoutMs` option. `fetchFn` receives an `AbortSignal` for the attempt as its argument. When the timeout runs out, that signal is aborted, so a `fetchFn` that passes it to `fetch` cancels the request, and the attempt fails with the new `QueryTimeoutError` even if `fetchFn` ignores the signal. A hung upstream therefore costs a server render at most the timeout instead of stalling it.

A timeout is a server-side network-level failure: it is logged as an error, reported through `reportError` and the fallback is returned. It is not retried, unlike a connection failure. `QueryTimeoutError` has its own `name`, so reporters that group errors by name keep timeouts apart from `TypeError: fetch failed` connection resets.

In the browser there is no timeout and `fetchFn` receives no signal. Existing `fetchFn` functions that take no arguments keep working; pass the signal on to `fetch` to have the request cancelled.
