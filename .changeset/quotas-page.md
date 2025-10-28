---
'squareone': minor
---

Add Quotas page for viewing user resource limits

A new Quotas page is now available at `/settings/quotas` that displays user quota allocations from Gafaelfawr for notebook servers, API rate limits, and TAP concurrent query limits.

**New features:**

- **QuotasView component**: Displays quota information organized into three conditional sections:
  - Notebooks section: Shows CPU cores, memory (GB), and spawning status (only displayed when disabled)
  - Rate limits section: Shows API request quotas per service in a 15-minute window
  - Concurrent queries section: Shows TAP database query limits per service
- **Settings navigation**: Added "Quotas" link to the settings sidebar between "Access tokens" and "Sessions"
- **Deep linking**: Each section has an anchor tag for direct linking (`#notebook`, `#rate-limit`, `#tap`)
- **Empty states**: Sections are omitted when no data is available; "Not configured" message shown if entire quota object is missing
