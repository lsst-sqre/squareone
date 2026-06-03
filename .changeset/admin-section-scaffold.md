---
"squareone": patch
---

Add the reusable `/admin` section scaffold, mirroring the `/settings`
sidebar-layout pattern.

- New `app/admin/layout.tsx` (server, loads config) → `AdminLayoutClient.tsx`
  (client, `usePathname()`) → shared `<SidebarLayout sidebarTitle="Admin">`,
  driven by a new flat `getAdminNavigation()` (a single `/admin/sentry` item, no
  categories).
- New reusable `getFirstNavItemHref(navSections)` helper in the `SidebarLayout`
  module (exported from its `index.ts`): returns the first nav item's href, or
  `null` as a safe fallback for an empty nav.
- `app/admin/page.tsx` index route redirects to the first sidebar nav item via
  that helper (currently `/admin/sentry`); reordering the nav changes the target
  with no other code change. An empty nav renders a fallback instead of
  redirecting.
- Minimal `app/admin/sentry/page.tsx` placeholder so the redirect resolves.

No access gating in this slice; the Phalanx ingress remains the deployment-time
enforcement.
