---
"squareone": patch
---

Drive the `/api-aspect` endpoint listing from Repertoire service discovery.

The page now resolves discovery server-side and renders one section per dataset
(`dp1`/`dp02`/`dp03`), each listing every service by name with its base URL, so
the endpoints are present in the server-rendered HTML with no client-side
discovery fetch. The listing is embedded via an `<ApiEndpoints/>` MDX component
so per-environment prose keeps control of the surrounding content.

Degrades gracefully, mirroring the server-side discovery pattern in the App
Router layout: the listing is omitted when `repertoireUrl` is unset, and a brief
"temporarily unavailable" notice (plus a server-side log) is shown when the
discovery fetch fails. This is the discovery-driven skeleton; curated labels,
links, and URLs follow in later work.
