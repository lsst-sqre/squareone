---
"squareone": minor
---

Migrated four pages from Pages Router to App Router:

- Home page (`/`)
- Docs page (`/docs`)
- Support page (`/support`)
- API Aspect page (`/api-aspect`)

Created the App Router foundation:

- Root layout (`src/app/layout.tsx`) with PageShell integration
- Providers wrapper (`src/app/providers.tsx`) for theme and config contexts
- Force dynamic rendering to support runtime configuration loading
