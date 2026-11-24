---
'squareone': patch
---

A hung Repertoire delays a page render by about 5 seconds at most, and an unavailable one no longer empties service discovery

Every server-side service discovery lookup is now bounded, not only the layout's discovery prefetch: the lookup for config defaults (`siteName`, `environmentName`, `baseUrl` and `timesSquareUrl`), the broadcasts prefetch and the pages that render from discovery. After a lookup times out, the others in the same render, and in renders over the next 5 seconds, don't wait again, so a render waits for one timeout in total rather than one per lookup.

While Repertoire is unavailable, the server keeps serving the last discovery document it received, however old, instead of falling back to empty discovery and the config fallbacks. Such failures are still logged, and the discovery prefetch still retries a single connection reset and reports lasting failures to Sentry as before.
