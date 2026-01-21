---
"squareone": minor
---

Migrate Settings UI pages to App Router with TanStack Query

**Migrated pages:**

- `/settings` - Account overview with MDX content
- `/settings/tokens` - Access token list with create button
- `/settings/tokens/new` - Create new access token form
- `/settings/tokens/[id]` - Token detail view
- `/settings/tokens/history` - Token change history with pagination
- `/settings/sessions` - Active sessions list
- `/settings/sessions/[id]` - Session detail view
- `/settings/sessions/history` - Session history with pagination
- `/settings/quotas` - Resource quotas display

**New components:**

- `AuthRequired` - Reusable client component for auth-protected pages with login redirect
- `SettingsLayoutClient` - App Router settings layout with sidebar navigation
