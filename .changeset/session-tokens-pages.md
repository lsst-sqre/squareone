---
'squareone': minor
---

Add session tokens management pages

Implements a new `/settings/sessions` section for viewing and managing web sessions, notebook sessions, and internal tokens. This feature provides users with a unified interface to monitor and control their active sessions across the platform.

New pages:

- **`/settings/sessions`** main page: Tab-based UI using the new Tabs component for type-based filtering with URL state management. `?type=` query parameter persists selected tab.
- **`/settings/sessions/history`** page: Displays change history for sessions with tab-based navigation and filter persistence.
- **`/settings/sessions/[id]`** details page: Shows detailed information for individual session tokens with edit/delete capabilities.

New components:

- **SessionTokensView component**: Displays tokens by type (web sessions, notebook sessions, internal tokens) with filtering, loading states, and error handling
- **SessionTokenItem component**: Individual token card showing metadata (creation date, expiration, host), with delete functionality
