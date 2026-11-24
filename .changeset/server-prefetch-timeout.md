---
'squareone': patch
---

Server-side prefetches give up after 5 seconds, and an upstream outage is no longer hydrated into the page

The server-side prefetches of service discovery, broadcasts, user info and user scopes now abort a request to Repertoire, Semaphore or Gafaelfawr that hasn't answered within 5 seconds, so a hung service no longer stalls page rendering. The 5 seconds include the single retry of a reset connection, so no prefetch waits longer. The timeout is reported to Sentry as a `QueryTimeoutError`, and it isn't retried. Each upstream's timeouts form their own Sentry issue, fingerprinted by the prefetch's `site` tag, apart from connection resets (`TypeError: fetch failed`).

When one of these prefetches fails with a timeout, a network error, a 5xx or an invalid response, the failure is logged and reported as before, but its fallback is no longer hydrated into the page as fresh data. Instead the query is left out of the page and the browser fetches it itself. Previously a signed-in user whose Gafaelfawr request was merely slow was hydrated as logged out, and on pages that require a login was sent to log in; a Repertoire outage with no earlier discovery document hydrated empty service discovery, which showed no services until a reload; and a Semaphore outage hid broadcasts until the next poll. An anonymous visitor's 401 from Gafaelfawr still hydrates as logged out, and while Repertoire is unavailable the last discovery document the server received is still hydrated.
