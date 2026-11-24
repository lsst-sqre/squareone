---
'@lsst-sqre/api-client-core': minor
---

Retry server-side connection failures once in `reportingQueryFn`

When a server-side fetch fails because its connection failed or dropped, `reportingQueryFn` now retries it once, immediately. A connection failure is the `TypeError` that `fetch` rejects with when its `cause` carries one of the codes `ECONNRESET`, `ECONNREFUSED`, `ECONNABORTED`, `EPIPE` or `UND_ERR_SOCKET`, such as `TypeError: fetch failed` caused by `read ECONNRESET`. If the retry succeeds, its value is returned, the first failure is logged as a warning with the call-site context, and nothing is reported, so a single dropped connection during a server render no longer reaches Sentry. If the retry fails as well, the existing failure path runs once for the retry's error: it is logged as an error, reported if report-worthy, and the fallback is returned.

Nothing else is retried: not HTTP errors (4xx and 5xx), contract drift or timeouts, nor other network-level failures that would fail the same way again, such as the `SyntaxError` from parsing an HTML error page as JSON or the `TypeError` for a URL that can't be parsed. Which errors are report-worthy is unchanged, and browser behaviour is unchanged. Query options built on `reportingQueryFn` get the retry without any changes.
