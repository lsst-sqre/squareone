---
'squareone': minor
---

Show TAP data-scanned quotas on the quotas page

The `/settings/quotas` page has a new "Data scanned" section, between "Concurrent queries" and "Rate limits", that lists the user's per-TAP-service `bytes_billed` quota from Gafaelfawr: the total amount of data each service may scan to produce the user's query results within a 24-hour period. Rows are keyed by TAP service name, sorted by name, and show the limit in binary units with IEC labels, such as `10 GiB` for a quota of 10737418240 bytes. A TAP service without a `bytes_billed` quota is listed under "Concurrent queries" only, and the section is hidden when no TAP service has one. The "Concurrent queries" rows are unchanged.
