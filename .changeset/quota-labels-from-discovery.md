---
'squareone': minor
---

The rate limits on the `/settings/quotas` page are now labelled from Repertoire service discovery. Each Gafaelfawr API quota is matched to the quota label a service declares, so a row reads, for example, "Table access protocol (TAP) — TAP API calls: 100 requests" instead of "tap: 100 requests", with a link to the service's documentation when discovery provides one. The rows are sorted by these labels. Quotas whose label discovery flags as `internal` are hidden. When service discovery is configured, the page waits for it before showing the quotas, so the raw quota names don't flash up before the labelled, re-sorted rows.

The page no longer hides quotas whose names start with `muster-`. Muster's quota label is hidden once discovery flags it as `internal`. Without service discovery, or in environments running Repertoire 2.x (which declares no quota labels), the raw quota names are shown, now including any `muster-` quotas.
