---
"squareone": minor
---

Begin Next.js App Router migration

Migrated four pages from Pages Router to App Router:
- Home page (`/`)
- Docs page (`/docs`)
- Support page (`/support`)
- API Aspect page (`/api-aspect`)

Created the App Router foundation:
- Root layout (`src/app/layout.tsx`) with PageShell integration
- Providers wrapper (`src/app/providers.tsx`) for theme and config contexts
- Force dynamic rendering to support runtime configuration loading

The Pages Router versions remain in place during the migration period, with App Router taking precedence for these routes.
