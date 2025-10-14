---
'squareone': minor
---

Add comprehensive token change history viewing

Implements a complete token change history system that allows users to view the full audit trail of changes to their Gafaelfawr access tokens:

**New Components:**
- `TokenHistoryView` - Main view with filters, summary stats, and paginated history list
- `TokenHistoryFilters` - Date range and event type filtering with URL state persistence
- `TokenHistoryList` - Infinite scroll pagination for history entries
- `TokenHistoryItem` - Individual change entry display with action-specific formatting
- `TokenHistoryDetails` - Detailed change information with before/after comparisons
- `TokenHistorySummary` - Statistics panel showing total changes, first/last activity
- `TokenScopeBadge` - Visual badges for token scopes
- `TokenScopeChangeBadge` - Diff display for scope modifications (added/removed)

**New Hooks:**
- `useTokenChangeHistory` - SWR-based infinite pagination for change history API
- `useTokenHistoryFilters` - URL-based state management for filters
- `useTokenDetails` - Fetch individual token details from Gafaelfawr API

**New Pages:**
- `/settings/tokens/history` - Global token change history for all user tokens
- `/settings/tokens/[id]` - Individual token details with dedicated history view

**Features:**
- Infinite scroll pagination with "Load more" button
- Date range filtering with DateTimePicker integration
- Event type filtering (creation, revocation, expiration, scope changes, etc.)
- URL-based filter state (shareable/bookmarkable filtered views)
- Local timezone support for all timestamps
- Graceful handling of deleted tokens (shows history even when token no longer exists)
- Responsive design with proper loading and error states
- Comprehensive test coverage for all components and hooks

This feature provides complete visibility into token lifecycle events, helping users understand token usage patterns and security-relevant changes.
