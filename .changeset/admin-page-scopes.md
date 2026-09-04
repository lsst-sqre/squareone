---
"squareone": minor
---

Add the `adminPageScopes` configuration key, mapping each admin page to the Gafaelfawr scopes that grant access to it (any-of semantics), and make the admin navigation follow it. Gafaelfawr's per-endpoint scopes are Helm-configurable per environment and are not discoverable at runtime, so the scope guarding each admin API is now configuration rather than a hard-coded constant. Deployments need no config change: the defaults (`notifications: admin:notifications`, `serviceTokens: admin:token`, `oidcClients: admin:oidc`, `sentry: exec:admin`) match Gafaelfawr's standard admin scopes, and a config may override only the pages it cares about. Page ids are fixed in code, so an unrecognized id fails schema validation at startup; configuring a page with an empty scope list hides it from everyone.

The admin sidebar now lists only the pages the signed-in user holds a scope for, so nobody is offered a page that would answer 403, and `/admin` redirects client-side to the first page that user can actually see (someone holding only `admin:notifications` lands on `/admin/notifications`) — rendering a "No admin pages are available for your account" state when nothing is visible. Navigation order stays code-defined. See the new "Admin section access" page in the deployment guide.
