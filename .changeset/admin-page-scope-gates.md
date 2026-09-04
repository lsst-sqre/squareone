---
"squareone": minor
---

Gate the admin section and each admin page on the scopes configured in `adminPageScopes` instead of a hard-coded `exec:admin`. There is no longer a single "admin" scope: the header's "Admin" link and the section-wide `AdminRequired` gate admit anyone who can reach at least one admin page, and `exec:admin` opens the section only because the `sentry` page defaults to it. Deployments using Gafaelfawr's standard admin scopes see no change; an environment that points a page at a different scope now has that scope honored everywhere.

Each admin page additionally gates on its own configured scopes, so visiting `/admin/service-tokens` without a scope that page lists renders an "Unauthorized" note naming the scopes that would have granted access, rather than a page whose every request answers 403. The notifications and service-token compose forms read the same configured scopes for their in-form gate.
