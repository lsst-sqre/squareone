---
"squareone": patch
---

Add the `/admin/service-token` admin page scaffold.

- New `app/admin/service-token/page.tsx` (server, `generateMetadata` from the
  resolved app config, mirroring `app/admin/sentry/page.tsx`) → a `'use client'`
  `ServiceTokenPageClient` that renders the page heading and placeholder sections
  for the creation form and the manage-existing-tokens section (filled in by
  later tasks).
- New `{ href: '/admin/service-token', label: 'Service tokens' }` item in
  `getAdminNavigation()`, so the page appears in the admin sidebar. Sentry stays
  first, leaving the `/admin` index redirect target unchanged.

The page sits inside the admin section, so it inherits the `AdminRequired` /
`exec:admin` gate from the admin layout.
