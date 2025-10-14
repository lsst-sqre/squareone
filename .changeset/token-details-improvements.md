---
'squareone': minor
---

Add token details page and enhance token management UI

**New Features:**
- Individual token details page at `/settings/tokens/[id]` showing comprehensive token information
- `TokenDetailsView` component with metadata display (scopes, creation date, expiration, parent info)
- Clickable token IDs throughout the UI that link to token details pages
- "View history" button on main tokens page for quick access to change history
- Standalone `TokenDate` component for consistent date/time formatting across views

**Improvements:**
- Removed confusing "Last used" date displays (data reliability issues)
- Fixed token created date incorrectly showing as "Expired"
- Better visual hierarchy in token listings with clickable elements
- Consistent ISO 8601 timestamp display with relative time formatting
- Proper handling of undefined/null token fields from API
- Integration with token history viewing workflow

**Components:**
- `TokenDetailsView` - Full token information display with action buttons
- `TokenDate` - Reusable date formatting component with semantic HTML time elements
- Enhanced `AccessTokenItem` with clickable token ID links
- Date formatter utilities for consistent timestamp handling

This update improves the token management experience by providing dedicated detail views and clearer navigation between token information and change history.
