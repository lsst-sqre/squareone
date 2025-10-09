# Token History Implementation Plan

## Project Overview

This document outlines the implementation plan for a token change history feature that displays audit logs for user access tokens and session tokens. The implementation includes:

1. **Token Details Page** (`/settings/tokens/{id}`) - Shows metadata and change history for a specific token (no filter UI)
2. **Token History Page** (`/settings/tokens/history`) - Shows change history for all user tokens with filtering controls
3. **Reusable Components** - TokenHistoryView can be embedded in details pages (without filters) or standalone history pages (with filters)

**Key distinction:**
- Token details page: Pre-filtered to single token, no filter controls shown
- Token history page: Shows all user tokens with TokenHistoryFilters component for filtering by date, token key, and IP address

The architecture is designed to support future expansion to `/settings/sessions/{id}` and `/settings/sessions/history` for session tokens.

## Requirements

### Functional Requirements

1. **Display token change history** - Show audit logs from GET `/auth/api/v1/users/{username}/token-change-history`
2. **Filter by token type** - Initial implementation for `user` tokens, architecture supports `session`, `notebook`, `internal`
3. **Pagination** - "Load more" button to fetch additional pages using `cursor` and `limit` parameters
4. **Filter by token key** - On history page: UI controls for filtering; On details page: automatically filtered to single token
5. **Date range filtering** - Support `since` and `until` query parameters (only on history page with filter controls)
6. **URL state management** - All filters reflected in query string for bookmarking and sharing (history page only)
7. **Responsive design** - Works on mobile and desktop without horizontal scrolling

### Non-Functional Requirements

1. **Code reuse** - Leverage existing components from AccessTokensView
2. **Design tokens** - Use only tokens from `@lsst-sqre/global-css` and `@lsst-sqre/rubin-style-dictionary`
3. **Accessibility** - Semantic HTML, keyboard navigation, ARIA labels
4. **Performance** - Efficient rendering, SWR caching, pagination

## Design Decision

**Selected Design: Option 3 - Hybrid List with Expandable Details**

This approach provides:
- Compact summary lines for efficient scanning
- Expandable details panel for full information
- Excellent mobile responsiveness
- Clear display of edit diffs using colored pills
- Progressive disclosure pattern

### Visual Design

**Summary Line Format:**
```
⊕ 2h ago Created "My Laptop Token" by jsick
```

For session tokens without names (when showing multiple token types):
```
⊕ 2h ago Created session token abc123xyz by jsick
```

**Expanded Details Format (Create Event):**
```
⊖ 2h ago Created "My Laptop Token" by jsick
  ┌─────────────────────────────────────────┐
  │ ID        abc123xyz (click to filter)   │
  │ Parent    xyz789abc (click to filter)   │
  │ Actor     jsick from 192.168.1.1        │
  │           (IP is clickable to filter)    │
  │ Timestamp 2025-03-15 14:30:45 UTC       │
  │                                         │
  │ Expires   March 15, 2025                │
  │ Scopes    [read:tap] [exec:notebook]    │
  │           (colored badges without icons) │
  └─────────────────────────────────────────┘
```

**Expanded Details Format (Edit Event):**
```
⊖ 1d ago Edited "My Laptop Token" by jsick
  ┌─────────────────────────────────────────┐
  │ ID        abc123xyz (click to filter)   │
  │ Parent    xyz789abc (click to filter)   │
  │ Actor     jsick from 192.168.1.1        │
  │           (IP is clickable to filter)    │
  │ Timestamp 2025-03-15 14:30:45 UTC       │
  │                                         │
  │ Changes                                 │
  │                                         │
  │ Name      Old Name → New Name           │
  │           (old in light gray)           │
  │ Expires   Mar 10 → Mar 15, 2025         │
  │           (old in light gray)           │
  │ Scopes    [- write:tap] [+ read:tap]    │
  │           (outline/soft variants)        │
  └─────────────────────────────────────────┘
```

**Expanded Details Format (Revoke Event):**
```
⊖ 3d ago Revoked "My Laptop Token" by jsick
  ┌─────────────────────────────────────────┐
  │ ID        abc123xyz (click to filter)   │
  │ Actor     jsick from 192.168.1.1        │
  │ Timestamp 2025-03-12 10:15:30 UTC       │
  └─────────────────────────────────────────┘
```

**Semantic Markup:**
- Use `<dl>` (definition list) for all metadata and detail fields
- Use `<dt>` (definition term) for labels (ID, Parent, Actor, Timestamp, Expires, Scopes, Name)
- Use `<dd>` (definition description) for values
- Flexbox layout: labels left-aligned, values start at consistent position
- Labels use `--rsd-color-gray-500` for subtle presentation
- Values use default text color for readability

**Implementation notes:**
- Parent field only shown when `entry.parent` is not null
- IP address only shown when `entry.ip_address` is not null
- "Changes" section only shown for edit actions
- For create/revoke/expire: show Expires and Scopes (when applicable)
- For edit: show only changed fields under "Changes" header
- Old values in Name/Expires changes use `--rsd-color-gray-400` with `→` arrow separator
- Scope changes use TokenScopeChangeBadge components (with +/- icons and outline/soft variants)
- Current scopes in create events use TokenScopeBadge components (no icons)

**Navigation:**
- Token ID and Parent links navigate to `/settings/tokens/{key}` (token details page)
- IP address link sets `?ip_address={ip}` filter on current history page

**Color Coding:**
- Create actions: Green accent (`--rsd-color-green-500`)
- Edit actions: Blue accent (`--rsd-color-blue-500`)
- Revoke actions: Red accent (`--rsd-color-red-500`)
- Expire actions: Gray accent (`--rsd-color-gray-500`)

**Change Badges:**
- Removed scopes: Outline variant with minus icon `[-  scope]`, uses scope-specific color
- Added scopes: Soft variant with plus icon `[+  scope]`, uses scope-specific color

## Data Model

### API Endpoints

#### Token Change History

```
GET /auth/api/v1/users/{username}/token-change-history
```

**Query Parameters:**
- `token_type` - Filter by type (e.g., "user", "session")
- `key` - Filter by specific token key (22 chars)
- `since` - Start date (ISO 8601 format)
- `until` - End date (ISO 8601 format)
- `ip_address` - Filter by IP or CIDR block
- `cursor` - Pagination cursor (format: `^p?[0-9]+_[0-9]+$`)
- `limit` - Number of results (default: 50)

**Note:** The UI uses `?token=` in the URL for clarity, which maps to the API's `key` parameter.

**Response Headers:**
- `Link` - Pagination links (RFC 5988)
- `X-Total-Count` - Total number of results

**Response Body:**
```typescript
type TokenChangeHistoryEntry = {
  token: string;                    // 22-char key
  username: string;
  token_type: TokenType;
  token_name: string | null;
  parent: string | null;
  scopes: string[];
  service: string | null;
  expires: number | null;           // Seconds since epoch
  actor: string;
  action: TokenChange;
  old_token_name: string | null;    // For edit actions
  old_scopes: string[] | null;      // For edit actions
  old_expires: number | null;       // For edit actions
  ip_address: string | null;
  event_time: number;               // Seconds since epoch
};

type TokenType = 'session' | 'user' | 'notebook' | 'internal' | 'service' | 'oidc';
type TokenChange = 'create' | 'revoke' | 'expire' | 'edit';
```

#### Token Details

```
GET /auth/api/v1/users/{username}/tokens/{key}
```

**Path Parameters:**
- `username` - Username (1-64 chars, pattern: `^[a-z0-9](?:[a-z0-9]|-[a-z0-9])*[a-z](?:[a-z0-9]|-[a-z0-9])*$`)
- `key` - Token key (exactly 22 chars)

**Response (200):**
```typescript
type TokenInfo = {
  username: string;
  token_type: 'session' | 'user' | 'notebook' | 'internal' | 'service' | 'oidc';
  service: string | null;
  scopes: string[];
  created?: number;                 // Seconds since epoch
  expires?: number;                 // Seconds since epoch (omitted = no expiration)
  token: string;                    // 22-char key
  token_name?: string;              // Omitted for some token types
  last_used?: number;               // Seconds since epoch (omitted = never used)
  parent: string | null;
};
```

**Error Responses:**
- **401**: Unauthenticated
- **403**: Permission denied
- **404**: Token not found
- **422**: Validation error

**Note:** This endpoint uses the same `TokenInfo` type as the token list endpoint, already defined in `useUserTokens` hook.

## Architecture

### Component Structure

```
components/
├── TokenDate/                              # Shared date display component
│   ├── index.ts                           # Exports TokenDate component
│   ├── TokenDate.tsx                      # Moved from AccessTokensView
│   ├── formatters.ts                      # Date formatting utilities (moved from AccessTokensView)
│   ├── TokenDate.stories.tsx              # Storybook stories
│   └── TokenDate.test.tsx                 # Vitest tests
│
├── TokenHistory/
│   ├── index.ts                           # Exports
│   ├── TokenHistoryView.tsx               # Container component (conditionally renders filters)
│   ├── TokenHistoryView.module.css
│   ├── TokenHistoryFilters.tsx            # Filter controls (only shown on history page)
│   ├── TokenHistoryFilters.module.css
│   ├── TokenHistoryList.tsx               # List container
│   ├── TokenHistoryList.module.css
│   ├── TokenHistoryItem.tsx               # Expandable list item
│   ├── TokenHistoryItem.module.css
│   ├── TokenHistorySummary.tsx            # Compact summary line
│   ├── TokenHistorySummary.module.css
│   ├── TokenHistoryDetails.tsx            # Expanded details panel
│   ├── TokenHistoryDetails.module.css
│   ├── TokenScopeBadge.tsx                # Wrapper for Badge with scope color logic
│   ├── TokenScopeBadge.module.css
│   ├── TokenScopeChangeBadge.tsx          # Wrapper for Badge (outline/soft variants)
│   ├── TokenScopeChangeBadge.module.css
│   ├── TokenHistoryView.stories.tsx       # Storybook stories
│   └── TokenHistoryView.test.tsx          # Vitest tests
│
├── TokenDetails/
│   ├── index.ts                           # Exports
│   ├── TokenDetailsView.tsx               # Token details container
│   ├── TokenDetailsView.module.css
│   ├── TokenDetailsView.stories.tsx       # Storybook stories
│   └── TokenDetailsView.test.tsx          # Vitest tests
│
└── AccessTokensView/
    ├── AccessTokenItem.tsx                # Update imports to use TokenDate/
    ├── tokenDateFormatters.ts             # DEPRECATED: Remove after refactoring
    └── ...
```

### Hook Structure

```
hooks/
├── useTokenChangeHistory.ts               # Fetch token change history
├── useTokenChangeHistory.test.tsx
├── useTokenHistoryFilters.ts              # URL state management for filters
├── useTokenHistoryFilters.test.tsx
├── useTokenDetails.ts                     # Fetch single token details
└── useTokenDetails.test.tsx
```

### Page Structure

```
pages/
└── settings/
    └── tokens/
        ├── [id].tsx                       # Token details page (dynamic route)
        │                                  # - Shows token metadata + history
        │                                  # - Uses TokenHistoryView with showFilters={false}
        │                                  # - Pre-filtered to single token
        └── history.tsx                    # Token history page (all user tokens)
                                           # - Shows history with filter controls
                                           # - Uses TokenHistoryView with showFilters={true}
```

## Implementation Steps

### Phase 1: Refactor TokenDate Component

**1.1 Create TokenDate component directory**

- Create `components/TokenDate/` directory
- Move `TokenDate.tsx` from `AccessTokensView/` to `TokenDate/`
- Move `tokenDateFormatters.ts` from `AccessTokensView/` to `TokenDate/formatters.ts`
- Create `TokenDate/index.ts` that exports TokenDate component and formatters
- Update imports in `AccessTokenItem.tsx` to use `TokenDate/`

**Files to create/modify:**
- `apps/squareone/src/components/TokenDate/index.ts` (new)
- `apps/squareone/src/components/TokenDate/TokenDate.tsx` (moved)
- `apps/squareone/src/components/TokenDate/formatters.ts` (moved, renamed)
- `apps/squareone/src/components/AccessTokensView/AccessTokenItem.tsx` (update imports)

**1.2 Add history-specific date formatting utilities**

Add new formatters to `TokenDate/formatters.ts`:
- `formatEventTime(eventTime: number)` - For summary lines (relative time, e.g., "2h ago")
- `formatEventTimeUTC(eventTime: number)` - For detail view (exact UTC, e.g., "2025-03-15 14:30:45 UTC")
- `formatEventTimeWithUTC(eventTime: number)` - Returns both display and datetime for TokenDate component

**1.3 Write tests for date formatting utilities**

Create unit tests for new formatters:
- Test `formatEventTime()` with various timestamps (seconds, minutes, hours, days ago)
- Test `formatEventTimeUTC()` for correct UTC formatting
- Test edge cases (null values, invalid dates)

### Phase 2: Create Data Layer

**2.1 Create useTokenChangeHistory hook**

Location: `apps/squareone/src/hooks/useTokenChangeHistory.ts`

```typescript
type UseTokenChangeHistoryOptions = {
  tokenType?: TokenType | TokenType[];  // Support single or multiple types
  token?: string;  // Maps to API 'key' parameter
  since?: Date;
  until?: Date;
  ipAddress?: string;
  limit?: number;
};

type UseTokenChangeHistoryReturn = {
  entries: TokenChangeHistoryEntry[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  hasMore: boolean;
  totalCount: number | undefined;
  loadMore: () => Promise<void>;
  isLoadingMore: boolean;
  mutate: KeyedMutator<PaginatedResponse>;
};

export default function useTokenChangeHistory(
  username: string | undefined,
  options: UseTokenChangeHistoryOptions
): UseTokenChangeHistoryReturn
```

**Implementation details:**
- Use SWR for data fetching and caching
- Handle pagination with cursor-based loading
- Parse `Link` header for pagination
- Parse `X-Total-Count` header
- Accumulate entries across pages
- Debounce filter changes (300ms)
- Support multiple token types (future: for session history page)
- Note: API endpoint accepts single `token_type` parameter, so multiple types require client-side filtering or multiple API calls
- Map `token` option to API `key` parameter when building query string

**Tests for useTokenChangeHistory:**
Create `useTokenChangeHistory.test.tsx`:
- Test fetching initial page
- Test loading more pages with cursor
- Test pagination cursor handling
- Test Link header parsing
- Test accumulating entries across pages
- Test error handling
- Test applying filters (token, dates, IP address)

**2.2 Create useTokenHistoryFilters hook**

Location: `apps/squareone/src/hooks/useTokenHistoryFilters.ts`

```typescript
type TokenHistoryFilters = {
  tokenType?: TokenType;
  token?: string;  // Renamed from 'key' to match API parameter
  since?: Date;
  until?: Date;
  ipAddress?: string;
};

type UseTokenHistoryFiltersReturn = {
  filters: TokenHistoryFilters;
  setFilter: <K extends keyof TokenHistoryFilters>(
    key: K,
    value: TokenHistoryFilters[K]
  ) => void;
  clearFilter: (key: keyof TokenHistoryFilters) => void;
  clearAllFilters: () => void;
  setIpAddressFilter: (ipAddress: string) => void;  // Helper for IP address click behavior
};

export default function useTokenHistoryFilters(): UseTokenHistoryFiltersReturn
```

**Implementation details:**
- Use Next.js router for URL state
- Serialize dates as ISO strings in URL
- Handle null/undefined values
- Use `shallow: true` routing to avoid full page reload
- Helper method for IP address filtering:
  - `setIpAddressFilter(ipAddress)`: Sets `?ip_address={ipAddress}` (resets other filters)
- Token ID and parent clicks use Next.js Link navigation to token details page (no filter helper needed)

**Tests for useTokenHistoryFilters:**
Create `useTokenHistoryFilters.test.tsx`:
- Test URL state management
- Test setting individual filters
- Test clearing filters
- Test clearing all filters
- Test date serialization/deserialization
- Test shallow routing behavior
- Test setIpAddressFilter helper

### Phase 3: Create UI Components

**3.1 Use existing Badge component from squared package**

The Badge component is already available in `@lsst-sqre/squared` (`packages/squared/src/components/Badge/Badge.tsx`) with the following features:
- Variants: 'solid', 'soft', 'outline'
- Colors: 'primary', 'blue', 'green', 'orange', 'purple', 'red', 'yellow', 'gray'
- Radius options: 'none', '1', 'full'
- Sizes: 'sm', 'md', 'lg'

**3.1a Create TokenScopeBadge component (wrapper for scope-specific styling)**

Location: `apps/squareone/src/components/TokenHistory/TokenScopeBadge.tsx`

```typescript
type TokenScopeBadgeProps = {
  scope: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'soft' | 'outline';  // Allow variant override
  children?: React.ReactNode;  // Allow custom content (for icons)
};
```

**Implementation:**
- Wraps the Badge component from `@lsst-sqre/squared`
- Applies scope-specific colors based on prefix (matching pattern from AccessTokenItem.tsx):
  - `exec:` -> red
  - `read:` -> green
  - `write:` -> yellow
  - default -> gray
- Defaults to 'soft' variant and 'full' radius for consistency with existing token display
- Accepts variant prop to allow consumers to override the variant
- Accepts children prop to allow custom content (defaults to just the scope text)
- Can be reused in both TokenHistoryDetails and AccessTokenItem (future refactoring)

**Tests and stories for TokenScopeBadge:**
- Create `TokenScopeBadge.test.tsx`:
  - Test scope color mapping logic (exec→red, read→green, write→yellow, default→gray)
  - Test size prop variations
  - Test variant prop override (soft, outline, solid)
  - Test children prop (custom content with icons)
  - Test default behavior (renders scope text without children)
- Create `TokenScopeBadge.stories.tsx`:
  - Story for each scope prefix with semantic colors (exec, read, write, default)
  - Different sizes (sm, md, lg)
  - Different variants (soft, outline, solid)
  - With custom children (showing extensibility for TokenScopeChangeBadge)

**3.2 Create TokenScopeChangeBadge component (for scope change indicators)**

Location: `apps/squareone/src/components/TokenHistory/TokenScopeChangeBadge.tsx`

```typescript
type TokenScopeChangeBadgeProps = {
  type: 'added' | 'removed';
  scope: string;  // Scope text (e.g., "read:tap")
  size?: 'sm' | 'md' | 'lg';
};
```

**Implementation:**
- Wrapper around **TokenScopeBadge component** (not Badge directly) to reuse color logic
- For 'added': passes `variant="soft"` with FontAwesome `faPlus` icon prepended to scope text
- For 'removed': passes `variant="outline"` with FontAwesome `faMinus` icon prepended to scope text
- Delegates all color logic to TokenScopeBadge (single source of truth for scope colors)
- Used exclusively for edit actions to show scope additions/removals

**Usage example:**
```tsx
// For added scope
<TokenScopeChangeBadge type="added" scope="read:tap" />
// Renders: [+ read:tap] in green (soft variant) because TokenScopeBadge determines scope starts with "read:"

// For removed scope
<TokenScopeChangeBadge type="removed" scope="write:tap" />
// Renders: [- write:tap] in yellow (outline variant) because TokenScopeBadge determines scope starts with "write:"
```

**Implementation detail:**
```tsx
export function TokenScopeChangeBadge({ type, scope, size }: TokenScopeChangeBadgeProps) {
  const icon = type === 'added' ? faPlus : faMinus;
  const variant = type === 'added' ? 'soft' : 'outline';

  return (
    <TokenScopeBadge scope={scope} variant={variant} size={size}>
      <FontAwesomeIcon icon={icon} /> {scope}
    </TokenScopeBadge>
  );
}
```

**Tests and stories for TokenScopeChangeBadge:**
- Create `TokenScopeChangeBadge.test.tsx`:
  - Test 'added' type renders with plus icon and soft variant
  - Test 'removed' type renders with minus icon and outline variant
  - Test that scope colors are delegated to TokenScopeBadge (inherits color logic)
  - Test size prop variations
- Create `TokenScopeChangeBadge.stories.tsx`:
  - Added/removed variants with various scope types (exec, read, write, default)
  - Show examples demonstrating outline vs soft variants
  - Different sizes (sm, md, lg)

**3.3 Create TokenHistorySummary component**

Location: `apps/squareone/src/components/TokenHistory/TokenHistorySummary.tsx`

```typescript
type TokenHistorySummaryProps = {
  entry: TokenChangeHistoryEntry;
  isExpanded: boolean;
  onToggle: () => void;
  showTokenType?: boolean;  // True when showing multiple token types
};
```

**Display format:**
- Disclosure triangle (⊕/⊖)
- Event time (relative): "2h ago"
- Action + token identifier:
  - If `token_name` exists: "Created 'My Token'"
  - If no `token_name` and `showTokenType=true`: "Created session token abc123xyz"
  - If no `token_name` and `showTokenType=false`: "Created token abc123xyz"
- Actor: "by jsick"
- Color-coded by action type

**Implementation notes:**
- Use `formatEventTime()` from `TokenDate/formatters.ts`
- Token identifier logic handles both named (user) and unnamed (session/notebook/internal) tokens
- `showTokenType` prop allows parent to control whether type is shown (useful for mixed-type views)

**3.4 Create TokenHistoryDetails component**

Location: `apps/squareone/src/components/TokenHistory/TokenHistoryDetails.tsx`

```typescript
type TokenHistoryDetailsProps = {
  entry: TokenChangeHistoryEntry;
};
```

**Semantic Structure:**
Use `<dl>` (definition list) with flexbox layout for all fields:
- `<dt>` elements for labels (styled with `--rsd-color-gray-500`)
- `<dd>` elements for values (aligned consistently with flexbox)
- Flexbox container: labels left-aligned, values start at consistent column position

**Display sections:**

1. **Metadata (always shown):**
   - **ID**: Token key as Next.js Link to `/settings/tokens/{key}`
   - **Parent**: Parent token key as Link to `/settings/tokens/{parent}` (only if `entry.parent` is not null)
   - **Actor**: Username with IP address if available (e.g., "jsick from 192.168.1.1")
     - IP address is clickable link that sets `?ip_address={ip}` filter
     - Only show IP portion if `entry.ip_address` is not null
   - **Timestamp**: Exact UTC time (e.g., "2025-03-15 14:30:45 UTC")

2. **For create/revoke/expire actions:**
   - **Expires**: Formatted date (if `entry.expires` is not null)
   - **Scopes**: List of TokenScopeBadge components (no icons)
     - Uses scope prefix colors: exec → red, read → green, write → yellow

3. **For edit actions only:**
   - **Changes** (small header/subheading above changed fields)
   - **Name** (only if changed):
     - Format: `<span style="color: --rsd-color-gray-400">Old Name</span> → New Name`
     - Old value in light gray, arrow separator, new value in default color
   - **Expires** (only if changed):
     - Format: `<span style="color: --rsd-color-gray-400">Mar 10</span> → Mar 15, 2025`
     - Old date in light gray, arrow separator, new date in default color
   - **Scopes** (only if changed):
     - Show removed scopes as TokenScopeChangeBadge with type="removed" (outline variant with minus icon)
     - Show added scopes as TokenScopeChangeBadge with type="added" (soft variant with plus icon)
     - Change badges use scope-specific colors with outline/soft variants to indicate removal/addition

**Implementation notes:**
- Use CSS Modules for flexbox layout (labels and values in two-column grid)
- Use `formatEventTimeUTC()` from `TokenDate/formatters.ts` for timestamp display
- Detect scope changes by comparing `entry.scopes` with `entry.old_scopes` (if present)
- For name/expires changes: render old value in `<span>` with gray color, then ` → `, then new value
- For scope changes:
  - Removed scopes = scopes in `old_scopes` but not in `scopes`
  - Added scopes = scopes in `scopes` but not in `old_scopes`
- Arrow separator: Use Unicode character `→` (U+2192)
- Parent and IP address fields: conditionally render only when not null

**Tests and stories for TokenHistoryDetails:**
- Create `TokenHistoryDetails.test.tsx`:
  - Test different action types (create, edit, revoke, expire)
  - Test conditional rendering (parent, IP address)
  - Test scope change detection logic
  - Test edit actions show only changed fields
- Create `TokenHistoryDetails.stories.tsx`:
  - Separate stories for each action type:
    - Create: shows Expires and Scopes with TokenScopeBadge
    - Edit: shows Changes section with name/expires arrows and scope change pills
    - Revoke: minimal metadata only
    - Expire: similar to revoke
  - Stories with/without parent and IP address

**3.5 Create TokenHistoryItem component**

Location: `apps/squareone/src/components/TokenHistory/TokenHistoryItem.tsx`

```typescript
type TokenHistoryItemProps = {
  entry: TokenChangeHistoryEntry;
  showTokenType?: boolean;  // Pass to TokenHistorySummary
  isExpanded?: boolean;     // Controlled expansion from parent
  onToggle?: () => void;    // Controlled expansion from parent
};
```

**Implementation:**
- Use `details`/`summary` elements for accessibility
- Support controlled expansion state (for expand/collapse all feature)
- Support uncontrolled expansion state (for individual interaction)
- Persist expansion state across re-renders when filters change (use token key as stable identifier)
- Keyboard navigation support
- Focus management
- Pass `showTokenType` prop through to TokenHistorySummary

**Tests and stories for TokenHistoryItem:**
- Create `TokenHistoryItem.test.tsx`:
  - Test controlled vs uncontrolled expansion
  - Test keyboard navigation
  - Test expansion state persistence
- Create `TokenHistoryItem.stories.tsx`:
  - All action types (create, edit, revoke, expire)
  - Expanded vs collapsed states
  - With/without token type display

**3.6 Create TokenHistoryList component**

Location: `apps/squareone/src/components/TokenHistory/TokenHistoryList.tsx`

```typescript
type TokenHistoryListProps = {
  entries: TokenChangeHistoryEntry[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  expandAll?: boolean;  // Control expansion state from parent
};
```

**Implementation:**
- Map entries to TokenHistoryItem components
- Determine `showTokenType` by checking if entries contain multiple token types
- Manage controlled expansion state when `expandAll` prop is provided
- Track individual item expansion states in Map keyed by token ID (for persistence across re-renders)
- "Load More" button at bottom using Button component with spinner mode when loading
- Empty state message: "No token history found"

**Token type detection:**
```typescript
const uniqueTypes = new Set(entries.map(e => e.token_type));
const showTokenType = uniqueTypes.size > 1;
```

**Expansion state persistence:**
```typescript
const [expandedItems, setExpandedItems] = useState<Map<string, boolean>>(new Map());
// Use token key as stable identifier to maintain expansion across filter changes
```

**Tests and stories for TokenHistoryList:**
- Create `TokenHistoryList.test.tsx`:
  - Test rendering multiple entries
  - Test "Load More" button behavior
  - Test empty state
  - Test expandAll prop
  - Test token type detection logic
- Create `TokenHistoryList.stories.tsx`:
  - Multiple entries with pagination
  - Empty state
  - Loading more state
  - Mixed token types

**3.7 Create TokenHistoryFilters component**

Location: `apps/squareone/src/components/TokenHistory/TokenHistoryFilters.tsx`

```typescript
type TokenHistoryFiltersProps = {
  filters: TokenHistoryFilters;
  onFilterChange: (filters: Partial<TokenHistoryFilters>) => void;
  onClearFilters: () => void;
  expandAll: boolean;
  onToggleExpandAll: () => void;
};
```

**Usage:**
- **Only shown on `/settings/tokens/history` page** (all user tokens with filtering)
- **Not shown on `/settings/tokens/[id]` page** (single token details - already filtered by token)

**Filter controls:**
- Date range picker (since/until) - Use date-time picker component from squared package
- Token key input (text input, no validation - let API handle it)
- IP address input (accepts CIDR notation, no client-side validation - let API handle it)
- Expand/collapse all button (toggles between "Expand All" and "Collapse All")
- Clear all filters button

**Layout:**
- Left section: Filter inputs (date range, token key, IP address)
- Right section: Action buttons (expand/collapse all, clear filters)

**Styling:**
- Use CSS Grid for layout
- Responsive: stack on mobile
- Use design tokens for spacing
- Buttons use `@lsst-sqre/squared` Button component
- Sticky positioning: stick to top only after scrolling past
- Show shadow (`--sqo-elevation-md`) when stuck to indicate content passes below

**Sticky behavior implementation:**
```css
position: sticky;
top: 0;
z-index: 10;

&.stuck {
  box-shadow: var(--sqo-elevation-md);
}
```

**Tests and stories for TokenHistoryFilters:**
- Create `TokenHistoryFilters.test.tsx`:
  - Test filter input changes
  - Test clear filters button
  - Test expand/collapse all button
  - Test DateTimePicker integration
- Create `TokenHistoryFilters.stories.tsx`:
  - Default state
  - With filters applied
  - Responsive layout (desktop vs mobile)

**3.8 Create TokenHistoryView component**

Location: `apps/squareone/src/components/TokenHistory/TokenHistoryView.tsx`

```typescript
type TokenHistoryViewProps = {
  username: string;
  initialTokenType?: TokenType | TokenType[];  // Support single or multiple types
  showFilters?: boolean;  // Default: false - only true on history page
  token?: string;  // Pre-filter to specific token (for token details page)
};
```

**Usage contexts:**
1. **History page** (`/settings/tokens/history`): `showFilters={true}`, shows TokenHistoryFilters component
2. **Token details page** (`/settings/tokens/[id]`): `showFilters={false}`, `token={tokenKey}` for pre-filtered history

**Implementation:**
- Integrate useTokenChangeHistory and useTokenHistoryFilters hooks
- Conditionally render TokenHistoryFilters only when `showFilters={true}`
- Pass `token` prop to useTokenChangeHistory to pre-filter by token key
- When `token` is provided, useTokenHistoryFilters is still used but filters are not shown in UI
- Manage `expandAll` state (boolean)
- Handle `toggleExpandAll` callback (can be in filters or separate control)
- Handle loading states:
  - Initial load: Show "Loading..." text
  - Load more: Button component handles spinner via squared library
- Handle error states: Show error message with retry option
- Handle empty states: "No token history found"
- Pass data and expansion state to child components
- Pass `initialTokenType` to useTokenChangeHistory for filtering

**State management:**
```typescript
const [expandAll, setExpandAll] = useState(false);
const handleToggleExpandAll = () => setExpandAll(prev => !prev);
```

**Loading states:**
```typescript
if (isLoading) {
  return <div>Loading...</div>;
}
```

**Tests and stories for TokenHistoryView:**
- Create `TokenHistoryView.test.tsx`:
  - Test component integration
  - Test with showFilters={true} vs showFilters={false}
  - Test with token prop (pre-filtered)
  - Test loading, error, and empty states
- Create `TokenHistoryView.stories.tsx`:
  - All states: loading, error, empty, data
  - With filters (history page mode)
  - Without filters (details page mode)
  - Pre-filtered to single token

### Phase 4: Create Pages and Token Details Components

**4.1 Create useTokenDetails hook**

Location: `apps/squareone/src/hooks/useTokenDetails.ts`

```typescript
import useSWR, { type KeyedMutator } from 'swr';
import type { TokenInfo } from './useUserTokens';

type UseTokenDetailsReturn = {
  token: TokenInfo | undefined;
  error: any;
  isLoading: boolean;
  mutate: KeyedMutator<TokenInfo>;
};

/**
 * Fetches details for a single token from GET /auth/api/v1/users/{username}/tokens/{key}
 */
export default function useTokenDetails(
  username: string | undefined,
  tokenKey: string | undefined
): UseTokenDetailsReturn
```

**Implementation details:**
- Use SWR for data fetching and caching
- Returns same `TokenInfo` type as `useUserTokens`
- Handle 404 errors (token not found)
- Revalidate on focus for fresh data

**Tests for useTokenDetails:**
Create `useTokenDetails.test.tsx`:
- Test single token fetching
- Test error handling (404, network errors)
- Test SWR caching behavior
- Test revalidation

**4.2 Create TokenDetailsView component**

Location: `apps/squareone/src/components/TokenDetails/TokenDetailsView.tsx`

```typescript
type TokenDetailsViewProps = {
  username: string;
  tokenKey: string;
};
```

**Display sections:**
1. **Token Metadata Card**
   - Token name (if applicable)
   - Token key (ID)
   - Token type (if not "user")
   - Created date
   - Last used date
   - Expiration date
   - Scopes (as Badge components)
   - Parent token (if applicable, as Link to parent details page)
   - Delete button (if token exists and user has permission)

2. **Change History Section**
   - Heading: "Change History"
   - TokenHistoryView component with `token={tokenKey}` and `showFilters={false}`
   - Shows history for this specific token only
   - **No filter controls shown** (TokenHistoryFilters component not rendered)

**Implementation notes:**
- Use `useTokenDetails` hook to fetch token data
- Use existing `useDeleteToken` hook for delete functionality
- Reuse AccessTokenItem styling/layout for metadata display
- Pass `token={tokenKey}` and `showFilters={false}` to TokenHistoryView for filtered history without UI filters
- Show loading state while fetching token details
- Handle 404 error (token not found) with helpful message

**Tests and stories for TokenDetailsView:**
- Create `TokenDetailsView.test.tsx`:
  - Test token details display
  - Test delete functionality
  - Test integration with TokenHistoryView (no filters)
  - Test loading state
  - Test 404 error handling
- Create `TokenDetailsView.stories.tsx`:
  - Token details with history
  - Loading state
  - Error states (404, network error)
  - Token with/without parent

**4.3 Create token details page**

Location: `apps/squareone/src/pages/settings/tokens/[id].tsx`

```typescript
export default function TokenDetailsPage({ appConfig }: PageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { username } = useUserInfo();

  if (!id || typeof id !== 'string') {
    return <div>Invalid token ID</div>;
  }

  return (
    <Layout>
      <Head>
        <title>Token Details - {appConfig.siteName}</title>
      </Head>
      <TokenDetailsView username={username} tokenKey={id} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { config: appConfig } = await loadAppConfig();
  return { props: { appConfig } };
};
```

**4.4 Create history page**

Location: `apps/squareone/src/pages/settings/tokens/history.tsx`

```typescript
export default function TokensHistoryPage({ appConfig }: PageProps) {
  const { username } = useUserInfo();

  return (
    <Layout>
      <Head>
        <title>Token History - {appConfig.siteName}</title>
      </Head>
      <TokenHistoryView
        username={username}
        initialTokenType="user"
        showFilters={true}
      />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { config: appConfig } = await loadAppConfig();
  return { props: { appConfig } };
};
```

**4.5 Accessibility verification**

Throughout implementation, verify:
- Keyboard navigation works for all interactive elements
- Screen reader compatibility (test with VoiceOver/NVDA)
- Color contrast meets WCAG AA standards (4.5:1 for text)
- Focus management is clear and logical
- Semantic HTML is used correctly (`<dl>`, `<dt>`, `<dd>`, `<details>`, `<summary>`)

## Design Token Reference

### Colors

**Action Colors:**
- Create: `--rsd-color-green-500` (#3cae3f)
- Edit: `--rsd-color-blue-500` (#1c81a4)
- Revoke: `--rsd-color-red-500` (#ed4c4c)
- Expire: `--rsd-color-gray-500` (#6a6e6e)

**Text Colors:**
- Primary: `--rsd-component-text-color` (#1f2121)
- Secondary: `--rsd-color-gray-500` (#6a6e6e)
- Link: `--rsd-component-text-link-color` (#146685)

**Background Colors:**
- Page: `--rsd-component-page-background-color` (#ffffff)
- Card: `--sqo-doc-card-background-color` (var(--rsd-color-gray-000))

### Spacing

Use `--sqo-space-*` tokens:
- `--sqo-space-xxxs`: 0.25em
- `--sqo-space-xxs`: 0.375em
- `--sqo-space-xs`: 0.5em
- `--sqo-space-sm`: 0.75em
- `--sqo-space-md`: 1.25em
- `--sqo-space-lg`: 2em
- `--sqo-space-xl`: 3.25em

### Border Radius

- `--sqo-border-radius-0`: 0px
- `--sqo-border-radius-1`: 4px
- `--sqo-border-radius-2`: 7px

### Elevation (Box Shadows)

- `--sqo-elevation-sm`: Subtle shadow for cards
- `--sqo-elevation-base`: Standard card shadow
- `--sqo-elevation-md`: Elevated elements

### Typography

Use standard HTML elements with base styles from `base.css`:
- Body text: default
- Headings: `<h1>`, `<h2>`, etc.
- Code/tokens: Use `font-family: monospace`

## Implementation Order

**Note:** Tests and Storybook stories should be written alongside each component/hook, not in a separate phase.

### Week 1: Foundation
1. Phase 1.1: Create TokenDate component directory and refactor
2. Phase 1.2: Add history-specific date formatters
3. Phase 1.3: Write tests for date formatting utilities
4. Phase 2.1: Create useTokenChangeHistory hook + tests
5. Phase 2.2: Create useTokenHistoryFilters hook + tests

### Week 2: Core UI
6. Phase 3.1a: TokenScopeBadge component + tests + stories
7. Phase 3.2: TokenScopeChangeBadge + tests + stories
8. Phase 3.3: TokenHistorySummary
9. Phase 3.4: TokenHistoryDetails + tests + stories
10. Phase 3.5: TokenHistoryItem + tests + stories

### Week 3: Integration
11. Phase 3.6: TokenHistoryList + tests + stories
12. Phase 3.7: TokenHistoryFilters + tests + stories
13. Phase 3.8: TokenHistoryView + tests + stories
14. Phase 4.1: useTokenDetails hook + tests
15. Phase 4.2: TokenDetailsView component + tests + stories

### Week 4: Pages and Accessibility
16. Phase 4.3: Token details page
17. Phase 4.4: Token history page
18. Phase 4.5: Accessibility verification across all components

## Testing Strategy

### Unit Tests (Vitest)

**Hook tests:**
```typescript
// useTokenChangeHistory.test.tsx
describe('useTokenChangeHistory', () => {
  it('fetches initial page');
  it('loads more pages');
  it('handles pagination cursor');
  it('parses Link header');
  it('accumulates entries across pages');
  it('handles errors');
  it('applies filters');
});
```

**Component tests:**
```typescript
// TokenHistoryView.test.tsx
describe('TokenHistoryView', () => {
  it('renders loading state');
  it('renders error state');
  it('renders empty state');
  it('renders history entries');
  it('expands/collapses items');
  it('loads more entries');
  it('filters by token key');
});
```

### Integration Tests

Test full page flow:
1. Load page with history
2. Expand an entry
3. Click token key to filter
4. Load more entries
5. Change date filters
6. Verify URL updates

### Storybook Stories

```typescript
// TokenHistoryView.stories.tsx
export const Default: Story = {
  args: {
    username: 'testuser',
    initialTokenType: 'user',
  },
};

export const Loading: Story = { /* ... */ };
export const Error: Story = { /* ... */ };
export const Empty: Story = { /* ... */ };
export const WithFilters: Story = { /* ... */ };
```

## Edge Cases and Error Handling

### Edge Cases

1. **No history entries** - Show empty state message: "No token history found"
2. **Very long token names** - Truncate with ellipsis
3. **Many scopes** - Wrap badges to multiple lines in detail view
4. **Automatic expiration** - Show "(system)" instead of actor
5. **No IP address** - Don't show IP address field (entry.ip_address is null)
6. **No parent token** - Don't show Parent field (entry.parent is null)
7. **Invalid dates** - Show "Invalid date" with raw value
8. **Pagination exhausted** - Hide "Load More" button
9. **Tokens without names** - Show token ID instead (session/notebook/internal tokens)
10. **Mixed token types** - Automatically show token type in summary when multiple types present
11. **Expand all with pagination** - Only affects currently loaded entries, new entries loaded later start collapsed
12. **Collapse all with some expanded** - Collapses all entries regardless of individual state
13. **Clickable fields** - Token ID and parent token navigate to details page; IP address sets filter
14. **Token not found (404)** - Show helpful error message on token details page
15. **Invalid token ID** - Handle malformed IDs in URL gracefully

### Error Handling

1. **Network errors** - Show error message with retry button
2. **401 Unauthorized** - Redirect to login
3. **403 Forbidden** - Show permission denied message
4. **Invalid cursor** - Reset pagination, show error
5. **Malformed response** - Log to console, show generic error

## Future Enhancements

### Component Refactoring (Next Sprint)

1. **Refactor AccessTokenItem to use TokenScopeBadge** - Update scopes display
   - Replace current Badge usage with TokenScopeBadge component
   - Ensures consistent color coding across token history and token list views
   - Centralizes scope color logic in one reusable component

### Phase 2 Features (Future)

1. **Session token details pages** - `/settings/sessions/{id}` for session/notebook/internal token details
   - Reuse TokenDetailsView component (already supports all token types via `TokenInfo`)
   - Update routing to handle both `/settings/tokens/{id}` (user tokens) and `/settings/sessions/{id}` (session/notebook/internal)
   - Parent token links should navigate to appropriate details page based on token type

2. **Session history page** - `/settings/sessions/history` for session/notebook/internal tokens
   - Reuse TokenHistoryView component with `initialTokenType` set to include multiple types
   - `showTokenType` will automatically activate to distinguish between session, notebook, and internal tokens
   - Example: `<TokenHistoryView username={username} initialTokenType={['session', 'notebook', 'internal']} />`

3. **Export functionality** - Download history as CSV or JSON
4. **Advanced filters** - Multi-select actions, scope filtering
5. **Full-text search** - Search within token names and actors
6. **Activity notifications** - Highlight unusual activity
7. **Comparison mode** - Select multiple entries to compare
8. **Virtual scrolling** - For very long histories (100+ entries)

### Responsive Enhancements

1. **Pull-to-refresh** - On mobile, pull down to refresh
2. **Swipe gestures** - Swipe to expand/collapse
3. **Bottom sheet filters** - On mobile, filters in bottom sheet
4. **Sticky filter bar** - Collapse on scroll

## Dependencies

### Existing Dependencies
- `swr` - Data fetching
- `react` - UI framework
- `next` - Framework
- `@fortawesome/react-fontawesome` - Icons
- `@lsst-sqre/squared` - Badge, Button, DateTimePicker components

### No New Dependencies Required
All functionality can be implemented with existing dependencies.

## Accessibility Checklist

- [ ] Semantic HTML (`<details>`, `<summary>`, `<time>`)
- [ ] ARIA labels for icon buttons
- [ ] Keyboard navigation (Tab, Enter, Space, Escape)
- [ ] Focus management (visible focus indicators)
- [ ] Screen reader announcements for loading states
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] High contrast mode support
- [ ] Form labels for filter inputs
- [ ] Error messages associated with inputs
- [ ] Skip links for navigation

## Performance Considerations

1. **Pagination** - Default limit of 50 items
2. **Debouncing** - 300ms debounce on filter inputs
3. **SWR caching** - Cache entries for 10 seconds
4. **Optimistic updates** - Show loading states during fetch
5. **CSS Modules** - Scoped styles, tree-shakeable
6. **Code splitting** - Page-level splitting with Next.js
7. **Lazy loading** - Consider for very long lists (future)

## Design Decisions (Resolved)

1. **Default date range** - ✓ Unlimited by default (no date filter applied initially)
2. **Mobile filter UI** - ✓ Inline filters (not bottom sheet)
3. **Sticky filter bar** - ✓ Stick only after scrolling past, with shadow when stuck
4. **Token key format** - ✓ Always show full key (22 chars)
5. **Date picker component** - ✓ Use date-time picker component from squared library (now available)
6. **Scopes display format** - ✓ Individual pill-shaped badges (neutral colored)
7. **Token ID click behavior** - ✓ Navigate to `/settings/tokens/{key}` (token details page)
8. **Parent token click behavior** - ✓ Navigate to `/settings/tokens/{parent}` (parent token details page, displayed when parent is not null)
9. **IP address click behavior** - ✓ Navigate to `?ip_address=<ip>`, reset all other filters (displayed when IP is not null)
10. **Expansion persistence** - ✓ Keep expanded items expanded when filters change (maintain expansion state across re-renders)
11. **Input validation** - ✓ Accept token keys and IP addresses as-is, let Gafaelfawr API validate
12. **Empty state message** - ✓ "No token history found"
13. **Initial loading state** - ✓ "Loading..." text
14. **Load more loading state** - ✓ Use Button component with spinner mode from squared library
15. **Sticky bar behavior** - ✓ Stick after scrolling past, show shadow to indicate content passes below

## Component Dependencies

### Badge Component (Available in Squared Library)

The `Badge` component is already available in `@lsst-sqre/squared` (`packages/squared/src/components/Badge/Badge.tsx`):

**Available features:**
- Variants: 'solid', 'soft', 'outline'
- Colors: 'primary', 'blue', 'green', 'orange', 'purple', 'red', 'yellow', 'gray'
- Radius options: 'none', '1', 'full'
- Sizes: 'sm', 'md', 'lg'
- Pill-shaped with configurable corner radius
- Inline display with proper line-height

**New wrapper components to create:**

1. **TokenScopeBadge** - Wraps Badge with scope-specific color logic:
   - Maps scope prefixes to semantic colors (exec: → red, read: → green, write: → yellow)
   - Matches existing pattern from `AccessTokenItem.tsx` (see `getScopeColor` function)
   - Defaults to 'soft' variant and 'full' radius
   - Accepts `variant` and `children` props for extensibility
   - **Single source of truth** for scope color logic
   - **Usage**: Display scopes in create/revoke/expire events
   - Can be reused across TokenHistoryDetails, TokenDetailsView, and (future) refactored AccessTokenItem

2. **TokenScopeChangeBadge** - Wraps **TokenScopeBadge** for scope change indicators:
   - 'added' type: passes `variant="soft"` with FontAwesome plus icon
   - 'removed' type: passes `variant="outline"` with FontAwesome minus icon
   - **Delegates color logic to TokenScopeBadge** - no color mapping in this component
   - **Usage**: Display scope changes in edit events only
   - Variant (outline vs soft) provides visual distinction between removals and additions
   - Maintains consistent color semantics by reusing TokenScopeBadge

### DateTimePicker Component (Available in Squared Library)

The `DateTimePicker` component is available in `@lsst-sqre/squared` (`packages/squared/src/components/DateTimePicker/DateTimePicker.tsx`):

**Available features:**
- ISO8601 string value format
- Calendar popover with date selection
- Time input controls (optional)
- Timezone selector (optional)
- Min/max date constraints
- Text input with validation
- Sizes: 'sm', 'md', 'lg'
- Full width option
- Accessibility support

**Usage for TokenHistoryFilters:**
- Use two DateTimePicker instances for 'since' and 'until' filters
- Set `showTime={true}` to allow precise timestamp filtering
- Set `showTimezone={false}` to simplify UI (API handles timezone conversion)
- Convert Date objects to ISO8601 strings for API requests


## Success Metrics

- [ ] Users can find specific token changes within 3 clicks
- [ ] Mobile usage works without horizontal scrolling
- [ ] Page load time under 2 seconds for first 50 entries
- [ ] Zero accessibility violations in automated testing
- [ ] 100% test coverage for hooks and critical components
- [ ] Positive user feedback on readability and usability
