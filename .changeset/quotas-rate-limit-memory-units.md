---
'squareone': patch
---

Clarify the units of rate limits and notebook memory on the quotas page

On the `/settings/quotas` page, each "Rate limits" row now states its limit as a rate, such as `100 requests/minute` (or `1 request/minute` for a limit of one), rather than `100 requests`. Documentation links still follow the limit. The notebook "Memory" row is now labelled `GiB` instead of `GB`, matching the binary units of Gafaelfawr's notebook memory quota and the IEC labels of the new Storage and Data scanned sections; the number shown is unchanged.
