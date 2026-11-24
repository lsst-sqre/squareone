---
'@lsst-sqre/api-client-core': minor
---

Time out server-side calls in `reportingQueryFn`

Server-side, each call of a `reportingQueryFn` query function now has a timeout: 5 seconds by default (exported as `DEFAULT_SERVER_TIMEOUT_MS`), or the new `timeoutMs` option. The timeout bounds the whole call, so the retry of a connection failure gets only the time left and the call never takes longer than `timeoutMs`. `fetchFn` receives an `AbortSignal` for the call as its argument. When the timeout runs out, that signal is aborted, so a `fetchFn` that passes it to `fetch` cancels the request, and the call fails with the new `QueryTimeoutError` even if `fetchFn` ignores the signal. A hung upstream therefore costs a server render at most the timeout instead of stalling it.

A `timeoutMs` that is not a positive, finite number (`0`, a negative number, `NaN` or `Infinity`) disables the timeout, rather than the 1 ms Node clamps such a timer to, which would fail every call at once.

A timeout is a server-side network-level failure: it is logged as an error, reported through `reportError` and the fallback is returned. It is not retried, unlike a connection failure. `QueryTimeoutError` has its own `name`, so reporters that group errors by name keep timeouts apart from `TypeError: fetch failed` connection resets.

In the browser there is no timeout and `fetchFn` receives no signal. Existing `fetchFn` functions that take no arguments keep working; pass the signal on to `fetch` to have the request cancelled.
