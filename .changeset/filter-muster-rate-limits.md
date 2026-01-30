---
'squareone': patch
---

Filter internal muster services from API rate limits display

- Filtered out `muster-` prefixed services from the API Rate Limits section in the quotas settings view, as these are internal services not meaningful to users
- The Rate Limits section now hides entirely when no user-facing services remain after filtering
