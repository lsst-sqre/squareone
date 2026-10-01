---
'squareone': minor
---

On the `/api-aspect` page, API endpoints for services that Squareone doesn't curate now use Repertoire service discovery metadata. An endpoint is labelled by the service's discovery title instead of its raw service name, and a book-icon link opens the service's documentation (`docs_url`) when discovery provides one. That link is labelled with the IVOA standard's name (for example "IVOA SSA docs") when the documentation is an IVOA standard, and "<endpoint> docs" otherwise. When discovery lists exactly one API version for such a service, the endpoint shows that version's URL (typically the service's query endpoint) instead of the service's base URL; with no versions or several, it shows the base URL. The alerts service under Prompt Products now appears as "Alert retrieval" with a link to its technote. Curated services (TAP, SIA, SODA, DataLink, GMS, and HiPS) render as before.

With Repertoire 2.x, which publishes no titles or documentation links, uncurated services still show their raw service name with no documentation link, and the alerts service is still labelled "Alerts". A service whose discovery title is empty or only whitespace is treated as untitled the same way, on both the `/api-aspect` page and the quotas page's rate limits.
