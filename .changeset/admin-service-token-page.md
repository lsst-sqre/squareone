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
  can grant any scope to a service token), an expiration selector defaulting
  to never, and a collapsible "Advanced metadata" section (collapsed by default)
  for the optional `name`/`email`/`uid`/`gid`/`groups` identity fields. Only the
  metadata fields the operator supplies are sent in the request body; omitted
  fields are absent. Reuses the squared `FormField`/`Button` primitives and the
  token `ScopeSelector`/`ExpirationSelector`.
- `ServiceTokenPageClient` wires the form to `useCreateServiceToken()`, reveals
  the new token secret once via `TokenSuccessModal`, and surfaces API errors via
  `TokenCreationErrorDisplay`.
- `admin:token` capability check: although the page sits behind the `exec:admin`
  gate, creating a service token also requires the `admin:token` scope. When the
  signed-in admin lacks it, `ServiceTokenPageClient` reads `loginInfo.scopes`,
  shows an explanatory warning banner, and disables the creation form (via a new
  `ServiceTokenForm` `disabled` prop) instead of letting a submit fail with a
  silent 403.
- `TokenSuccessModal` gains optional `templateUrl` (hides the "Copy token
  template" action when omitted) and `redirectUrl` (defaults to the user token
  list; the service-token page passes `null` to stay on the page), so it can be
  reused for service tokens without changing the user-token flow.
- Manage-existing-tokens section (`ManageServiceTokens`): a `bot-` username
  lookup (validated with the same `validateBotUsername` helper as the creation
  form) drives a service-scoped `AccessTokensView` to list that bot user's
  service tokens, each revocable via the existing `DeleteTokenModal` +
  `useDeleteToken` (the list refreshes automatically through query
  invalidation). An invalid or non-`bot-` username is rejected with a clear
  message and issues no request. Listing is always per looked-up bot username
  because Gafaelfawr exposes no global token enumeration. `AccessTokensView`
  gains optional `tokenType` (default `'user'`) and `emptyState` props so it can
  list `service` tokens and show a message when a looked-up user has none,
  without changing the user-token settings page.
