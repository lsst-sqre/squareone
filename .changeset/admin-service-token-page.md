---
"squareone": patch
---

Add the `/admin/service-token` admin page for creating Gafaelfawr service tokens.

- New `app/admin/service-token/page.tsx` (server, `generateMetadata` from the
  resolved app config, mirroring `app/admin/sentry/page.tsx`) → a `'use client'`
  `ServiceTokenPageClient`, and a `{ href: '/admin/service-token', label:
  'Service tokens' }` item in `getAdminNavigation()` so the page appears in the
  admin sidebar. The page sits inside the admin section, so it inherits the
  `AdminRequired` / `exec:admin` gate from the admin layout.
- New `ServiceTokenForm` component: a bot-username field (validated against the
  Gafaelfawr username rules, enforcing the `bot-` prefix), a token-name field,
  a scope picker fed the **full** configured scope list (an `admin:token` holder
  can grant any scope to a service token), and an expiration selector defaulting
  to never. Reuses the squared `FormField`/`Button` primitives and the token
  `ScopeSelector`/`ExpirationSelector`.
- `ServiceTokenPageClient` wires the form to `useCreateServiceToken()`, reveals
  the new token secret once via `TokenSuccessModal`, and surfaces API errors via
  `TokenCreationErrorDisplay`.
- `TokenSuccessModal` gains optional `templateUrl` (hides the "Copy token
  template" action when omitted) and `redirectUrl` (defaults to the user token
  list; the service-token page passes `null` to stay on the page), so it can be
  reused for service tokens without changing the user-token flow.

The manage-existing-tokens section remains a placeholder, filled in by a later
task.
