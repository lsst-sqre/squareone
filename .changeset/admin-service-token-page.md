---
"squareone": minor
---

Add the `/admin/service-tokens` admin pages for creating and managing Gafaelfawr service tokens.

- New `app/admin/service-tokens/` route (server `page.tsx` with `generateMetadata`
  from the resolved app config, mirroring `app/admin/sentry/page.tsx`) → a
  `'use client'` `ServiceTokenPageClient` landing page, plus a `{ href:
  '/admin/service-tokens', label: 'Service tokens' }` item in
  `getAdminNavigation()` so the page appears in the admin sidebar. The page sits
  inside the admin section, so it inherits the `AdminRequired` / `exec:admin`
  gate from the admin layout. The UI mirrors the user-token landing/list +
  `/new` split rather than stacking token creation and lookup under one client.
- Landing page (`/admin/service-tokens`): the `Service tokens` heading, a `Lede`
  + explanatory paragraphs (reusing the `Lede` typography component, as
  `/settings/tokens` does) describing service tokens as **machine** access that
  is not tied to a user account (a `bot-` identity) and steering services
  deployed inside the RSP's Kubernetes environment to provision a
  `GafaelfawrServiceToken` resource — linked to the external
  [Gafaelfawr docs](https://gafaelfawr.lsst.io/user-guide/service-tokens.html) —
  rather than using this form (which is primarily for granting RSP access to
  external services), a "Create a service token" button linking to
  `/admin/service-tokens/new`, and the manage-existing-tokens section
  (`ManageServiceTokens`). It carries no creation form and needs no login info.
- New `app/admin/service-tokens/new/` page (server `page.tsx` →
  `NewServiceTokenPageClient`) holds the creation flow: `useLoginInfo` + the
  `admin:token` capability gate, the `ServiceTokenForm`,
  `TokenCreationErrorDisplay`, and `TokenSuccessModal`, which returns to
  `/admin/service-tokens` on Done; Cancel returns there too.
- `/admin/service-tokens/new` is query-parameter fillable, mirroring
  `/settings/tokens/new`: `NewServiceTokenPageClient` reads `useSearchParams()`
  to pre-fill the form from `?username=`, `?scopes=<comma-list>`, and
  `?expiration=` (via `parseExpirationFromQuery`, so an invalid value is ignored
  and falls back to the "never" default), extended to the Advanced-settings
  metadata via `?name=`, `?email=`, `?uid=`, `?gid=`, and `?groups=<comma-list>`
  (the comma list normalised into the textarea's one-group-per-line format).
  Only supplied params populate fields; omitted ones keep the form's defaults.
  `ServiceTokenForm`'s `initialValues` accepts the optional metadata seed, and
  the page is wrapped in a `<Suspense>` boundary as the App Router requires for
  `useSearchParams()`.
- New `ServiceTokenForm` component: a bot-username field (validated against the
  Gafaelfawr username rules, enforcing the `bot-` prefix), a scope picker fed the
  **full** configured scope list (an `admin:token` holder can grant any scope to
  a service token), an expiration selector defaulting to never, and a collapsible
  "Advanced settings" section (collapsed by default) for the optional
  `name`/`email`/`uid`/`gid`/`groups` identity fields. Only the metadata fields
  the operator supplies are sent in the request body; omitted fields are absent.
  An optional `onCancel` prop renders a secondary Cancel button beside submit.
  Reuses the squared `FormField`/`Button` primitives and the token
  `ScopeSelector`/`ExpirationSelector`.
- `admin:token` capability check: although the page sits behind the `exec:admin`
  gate, creating a service token also requires the `admin:token` scope. When the
  signed-in admin lacks it, `NewServiceTokenPageClient` reads `loginInfo.scopes`,
  shows an explanatory warning banner, and disables the creation form (via the
  `ServiceTokenForm` `disabled` prop) instead of letting a submit fail with a
  silent 403.
- `TokenSuccessModal` gains optional `templateUrl` (hides the "Copy token
  template" action when omitted) and `redirectUrl` (defaults to the user token
  list; the new-service-token page passes `/admin/service-tokens`), so it can be
  reused for service tokens without changing the user-token flow.
- Token lookup lives on a dedicated, URL-driven `app/admin/service-tokens/search/`
  page (server `page.tsx` with `generateMetadata` → tab title
  `Look up service tokens | <siteName>`, plus a `<Suspense>`-wrapped
  `SearchServiceTokensPageClient` reading `useSearchParams()`), so a lookup can
  be bookmarked, shared, and back-navigated. `?q=` is the single source of truth:
  the search box is seeded from it (and re-synced on navigation), and submitting
  the box `router.push`es a new `?q=` history entry. Results derive from `q`
  (validated with the same `validateBotUsername` helper as the creation form) — an
  empty `q` prompts for a username and issues no request, an invalid / non-`bot-`
  `q` shows an inline error and issues no request, and a valid `q` lists that bot
  user's `service` tokens via a service-scoped `AccessTokensView`
  (`showDetailsLink={false}`, since the `/settings/tokens/<key>` details route does
  not resolve for service tokens), each revocable via the existing
  `DeleteTokenModal` + `useDeleteToken` (the list refreshes automatically through
  query invalidation). The intro links to `/admin/service-tokens/new`, carrying
  `?username=<q>` to pre-fill the creation form when `q` is a valid bot username.
  Listing is always per looked-up bot username because Gafaelfawr exposes no
  global token enumeration. The landing's `ManageServiceTokens` box keeps the
  "Look up tokens" entry point but now just redirects to the `/search` page
  (`?q=<trimmed>`) instead of rendering an inline list. `AccessTokensView` gains
  optional `tokenType` (default `'user'`) and `emptyState` props so it can list
  `service` tokens and show a message when a looked-up user has none, without
  changing the user-token settings page.
