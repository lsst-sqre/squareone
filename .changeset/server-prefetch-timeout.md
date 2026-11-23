---
'squareone': patch
---

Server-side prefetches give up after 5 seconds

The server-side prefetches of service discovery, broadcasts, user info and user scopes now abort a request to Repertoire, Semaphore or Gafaelfawr that hasn't answered within 5 seconds, so a hung service no longer stalls page rendering. The prefetch falls back as it does for any other failed request, for example to no broadcasts, and the page renders without waiting. The timeout is reported to Sentry as a `QueryTimeoutError`, which Sentry groups apart from connection resets (`TypeError: fetch failed`), and it isn't retried.
