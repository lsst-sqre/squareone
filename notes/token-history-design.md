# Token History UI Design Proposal

## Overview

This document outlines the design for a token change history component that displays audit logs for user access tokens and other token types. The component will be used on `/settings/tokens/history` initially for user tokens, with future expansion to `/settings/sessions/history` for session tokens.

## Requirements

### Functional Requirements

1. **Display token change history** from GET `/auth/api/v1/users/{username}/token-change-history`
2. **Filter by token type** - Initial implementation for `user` tokens, extensible to `session`, `notebook`, `internal`
3. **Pagination** - "Load more" button to fetch additional pages
4. **Filter by token key** - Clicking a token key adds `?key=` query parameter
5. **Date range filtering** - Support `since` and `until` query parameters
6. **URL state management** - Filters reflected in query string for bookmarking/sharing

### Data Complexity

Each history entry contains:
- **Core fields**: `event_time`, `action`, `actor`, `ip_address`
- **Token metadata**: `token` (key), `token_type`, `token_name`, `scopes`, `expires`
- **Edit history** (when `action === 'edit'`): `old_token_name`, `old_scopes`, `old_expires`
- **Context fields**: `username`, `parent`, `service`

**Challenge**: 12+ potential columns with variable data density

## Presentation Options

### Option 1: Timeline Card View

**Approach**: Vertical timeline with card-based entries, similar to AccessTokensView pattern

**Layout**:
```
┌─────────────────────────────────────────┐
│ [Filters: Date Range, Token, IP]       │
└─────────────────────────────────────────┘

● 2 hours ago - Token Created
┌─────────────────────────────────────────┐
│ Token: abc...xyz (clickable)            │
│ Name: "My Laptop Token"                 │
│ Actor: jsick from 192.168.1.1          │
│ Expires: March 15, 2025                 │
│ Scopes: exec:notebook, read:tap         │
└─────────────────────────────────────────┘

● 1 day ago - Token Edited
┌─────────────────────────────────────────┐
│ Token: abc...xyz (clickable)            │
│ Name: "My Laptop" → "My Laptop Token"   │
│ Actor: jsick from 192.168.1.1          │
│ Expires: Mar 10 → Mar 15, 2025          │
│ Scopes: added read:tap                  │
└─────────────────────────────────────────┘

        [Load More]
```

**Implementation**:
- CSS Grid layout within cards (similar to AccessTokenItem)
- Use `time` element for semantic timestamps
- Visual timeline with CSS pseudo-elements
- Color-coded actions (create=green, edit=blue, revoke=red, expire=gray)

**Pros**:
- Very readable, scannable
- Excellent for mobile responsiveness
- Easy to show before/after for edits
- Consistent with AccessTokensView pattern
- Natural grouping by time

**Cons**:
- Takes more vertical space
- Less dense for power users
- Harder to compare multiple entries side-by-side

### Option 2: Responsive Data Table (Tanstack Table)

**Approach**: Traditional table with collapsing/stacking columns on smaller screens

**Desktop Layout**:
```
┌──────────────┬────────┬───────┬────────────┬─────────────┬─────────┐
│ Time         │ Action │ Token │ Token Name │ Actor       │ Details │
├──────────────┼────────┼───────┼────────────┼─────────────┼─────────┤
│ 2 hours ago  │ Create │ abc..│ My Laptop  │ jsick       │    ⓘ    │
│ 1 day ago    │ Edit   │ abc..│ My Laptop  │ jsick       │    ⓘ    │
│ 3 days ago   │ Revoke │ def..│ Old Token  │ adminuser   │    ⓘ    │
└──────────────┴────────┴───────┴────────────┴─────────────┴─────────┘
```

**Mobile Layout** (cards or stacked):
```
┌─────────────────────────────────────────┐
│ 2 hours ago - Create                    │
│ Token: abc...xyz                        │
│ My Laptop Token (jsick)                 │
│ [View Details]                          │
└─────────────────────────────────────────┘
```

**Implementation**:
- Tanstack Table for sorting, filtering, column management
- Responsive column visibility (hide less critical columns on mobile)
- Expandable rows for full details (scopes, IP address, old values)
- Sticky header with filters

**Pros**:
- Familiar table interface
- Excellent for sorting and comparing
- Power users can scan many entries quickly
- Built-in Tanstack features (sorting, column order, etc.)
- Industry-standard pattern

**Cons**:
- Can feel cramped with many columns
- Mobile experience requires careful design
- Harder to show edit diffs elegantly
- May require horizontal scrolling

### Option 3: Hybrid List with Expandable Details

**Approach**: Compact list view with inline expansion for full details

**Collapsed State**:
```
┌─────────────────────────────────────────┐
│ [Filters: Date, Token, IP, Type]        │
└─────────────────────────────────────────┘

⊕ 2h ago • Created "My Laptop Token" by jsick
⊕ 1d ago • Edited "My Laptop Token" by jsick
⊕ 3d ago • Revoked "Old Token" by adminuser
⊕ 5d ago • Token expired (system)

        [Load More]
```

**Expanded State**:
```
⊖ 1d ago • Edited "My Laptop Token" by jsick
  ┌─────────────────────────────────────────┐
  │ Token: abc123xyz (view history)         │
  │ Actor: jsick from 192.168.1.1          │
  │                                         │
  │ Changes:                                │
  │ • Name: "My Laptop" → "My Laptop Token" │
  │ • Expires: Mar 10 → Mar 15, 2025        │
  │ • Scopes: +read:tap                     │
  └─────────────────────────────────────────┘
```

**Implementation**:
- Disclosure component for each row
- Compact summary line (timestamp + action + token name + actor)
- Full details in expansion panel
- CSS Grid for expanded content layout

**Pros**:
- Best of both worlds - compact but detailed
- Excellent scanning in collapsed state
- Deep details available on demand
- Works great on mobile
- Reduces overwhelming information

**Cons**:
- Requires interaction to see full details
- Not ideal for comparing multiple entries
- More complex state management

### Option 4: Grouped by Token with Accordion

**Approach**: Group history entries by token, show timeline within each token

**Layout**:
```
┌─────────────────────────────────────────┐
│ [Filters: Date Range, Show All Types]   │
└─────────────────────────────────────────┘

▼ "My Laptop Token" (abc123xyz) - 3 changes
  ├─ 2 hours ago: Created by jsick
  ├─ 1 day ago: Edited by jsick
  │  └─ Changed name and expiration
  └─ 3 days ago: Modified scopes by jsick

▶ "Old Token" (def456abc) - 1 change

▶ "Notebook Token" (ghi789def) - 5 changes

        [Load More Tokens]
```

**Implementation**:
- Group by token key, then sort by time within group
- Accordion for each token
- Sub-timeline within each token group
- Collapsible all/expand all controls

**Pros**:
- Excellent for tracking single token lifecycle
- Natural when filtering by token key
- Reduces visual clutter
- Easy to see related changes

**Cons**:
- Breaks chronological ordering across all tokens
- Not ideal for "what happened today?" questions
- Complex grouping logic for pagination
- Awkward when viewing all tokens together

## Recommendation

**Primary: Option 3 - Hybrid List with Expandable Details**

This approach provides the best balance for the token history use case:

1. **Scanning efficiency**: Users can quickly scan the compact summary lines to find what they're looking for
2. **Progressive disclosure**: Full details available without navigating away
3. **Mobile-friendly**: Works excellently on all screen sizes without horizontal scrolling
4. **Edit diffs**: Expanded state can elegantly show before/after changes
5. **Action-oriented**: Summary format emphasizes the action, which is what users care about

**Secondary consideration**: If user feedback indicates need for heavy sorting/filtering of many columns, consider migrating to **Option 2 (Tanstack Table)** in future iterations.

## Implementation Details

### Component Architecture

```
TokenChangeHistoryView/
├── index.ts                          # Exports
├── TokenChangeHistoryView.tsx        # Container component
├── TokenChangeHistoryFilters.tsx     # Filter controls
├── TokenChangeHistoryList.tsx        # List container
├── TokenChangeHistoryItem.tsx        # Individual expandable item
├── TokenChangeHistorySummary.tsx     # Compact summary line
├── TokenChangeHistoryDetails.tsx     # Expanded details panel
└── TokenChangeHistoryView.module.css # Styles
```

### Hooks

```typescript
// Primary data fetching hook
useTokenChangeHistory(username: string, options: {
  tokenType?: TokenType;
  key?: string;
  since?: Date;
  until?: Date;
  ipAddress?: string;
  limit?: number;
})

// Returns: { entries, isLoading, error, hasMore, loadMore }

// URL state management
useTokenHistoryFilters()
// Returns: { filters, setFilter, clearFilters }
// Syncs with query string
```

### Data Formatting

**Timestamp Display**:
- Recent: "2 hours ago", "5 minutes ago"
- Same day: "Today at 2:30 PM"
- This week: "Monday at 3:45 PM"
- Older: "Mar 15, 2025 at 4:20 PM"
- Use `Intl.RelativeTimeFormat` and `Intl.DateTimeFormat`

**Action Display**:
- `create`: "Created {token_name}"
- `edit`: "Edited {token_name}" (show changed fields)
- `revoke`: "Revoked {token_name}"
- `expire`: "Token expired" (system action)

**Actor Display**:
- With IP: "by {actor} from {ip_address}"
- Without IP: "by {actor}"
- System actions: "(system)" or "(automatic)"

**Changes (for edit actions)**:
- Name: "Name: 'old' → 'new'"
- Expires: "Expires: Mar 10 → Mar 15, 2025"
- Scopes added: "Scopes: +read:tap, +write:files"
- Scopes removed: "Scopes: -exec:admin"

### Accessibility

- Use semantic HTML: `<details>`, `<summary>`, `<time>`
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus management for expand/collapse
- Screen reader announcements for loading states
- High contrast support for action colors

### Performance Considerations

1. **Virtualization**: For very long histories (100+ items), consider virtual scrolling
2. **Pagination**: Default limit of 50 items, load more on demand
3. **Debouncing**: Debounce filter inputs (especially date pickers)
4. **Optimistic updates**: Show loading states while fetching more pages
5. **Caching**: Use SWR for data caching and revalidation

## Future Enhancements

1. **Export functionality**: Download history as CSV/JSON
2. **Advanced filters**: Multi-select for actions, scope filtering
3. **Search**: Full-text search within token names and actors
4. **Notifications**: Highlight recent unusual activity
5. **Analytics**: Show statistics (most active tokens, common actions)
6. **Comparison mode**: Select multiple entries to compare side-by-side

## Mobile Considerations

- Touch-friendly tap targets (min 44x44px)
- Swipe gestures for expand/collapse
- Sticky filter bar that collapses on scroll
- Bottom sheet for filter controls on small screens
- Pull-to-refresh for latest entries

## Visual Design Notes

**Color Coding** (using design tokens):
- Create: `--sqr-color-semantic-success` (green)
- Edit: `--sqr-color-semantic-info` (blue)
- Revoke: `--sqr-color-semantic-warning` (orange)
- Expire: `--sqr-color-semantic-neutral` (gray)

**Typography**:
- Summary line: `--sqr-font-size-body-md`, `--sqr-font-weight-medium`
- Timestamp: `--sqr-font-size-body-sm`, `--sqr-color-text-secondary`
- Details: `--sqr-font-size-body-sm`, `--sqr-font-family-mono` for tokens

**Spacing**:
- List items: `--sqr-spacing-md` between items
- Expanded content: `--sqr-spacing-lg` padding
- Filter section: `--sqr-spacing-xl` bottom margin

## Testing Strategy

1. **Unit tests**: Token formatting, date display, filter logic
2. **Component tests**: Expand/collapse behavior, loading states
3. **Integration tests**: API pagination, filter application
4. **Visual regression**: Storybook stories for all states
5. **Accessibility tests**: Automated a11y testing with axe

## Success Metrics

- Users can find specific token changes within 3 clicks
- Mobile usage doesn't require horizontal scrolling
- Page load time under 2 seconds for first 50 entries
- Zero accessibility violations in automated testing
- Positive user feedback on readability and usability
