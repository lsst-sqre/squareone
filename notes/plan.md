# Access Tokens View - Design Document & Implementation Plan

## 1. Architecture Overview

**Location**: `apps/squareone` (not squared package - uses app-specific features like authentication, API routes)

**Key Files to Create**:

```
apps/squareone/src/
  pages/
    settings/
      tokens.tsx                          # Page component
  components/
    AccessTokensView/
      AccessTokensView.tsx                # Main container component
      AccessTokensView.module.css         # CSS Module for styling
      AccessTokensView.stories.tsx        # Storybook stories
      AccessTokensView.test.tsx           # Vitest tests
      AccessTokenItem.tsx                 # Individual token item component
      AccessTokenItem.module.css          # CSS Module for token item
      AccessTokenItem.stories.tsx         # Storybook stories
      AccessTokenItem.test.tsx            # Vitest tests
      DeleteTokenModal.tsx                # Confirmation modal component
      DeleteTokenModal.module.css         # CSS Module for modal
      DeleteTokenModal.stories.tsx        # Storybook stories
      DeleteTokenModal.test.tsx           # Vitest tests
      index.ts                            # Clean exports
  hooks/
    useDeleteToken.ts                     # Hook for delete functionality
    useDeleteToken.test.ts               # Hook tests
  lib/
    utils/
      dateFormatters.ts                   # Date formatting utilities
      dateFormatters.test.ts              # Date formatter tests
```

## 2. Component Hierarchy

```
/settings/tokens (Page)
├── "Create a token" button (always visible)
└── AccessTokensView (Container - only if user tokens exist)
    ├── Loading State
    ├── Error State
    └── Token List
        └── AccessTokenItem × N
            ├── Token Info (left)
            ├── Expiration (top-right)
            ├── Last Used + Delete Button (bottom-right)
            └── DeleteTokenModal (conditional)
```

## 3. Data Flow

**Input**:

- `useGafaelfawrUser()` → provides username and authentication status
- `useUserTokens(username)` → filters to `token_type === 'user'` → sorts by `created` DESC
- `useLoginInfo()` → provides CSRF token

**Actions**:

- Not authenticated → redirect to login page via `getLoginUrl()`
- Delete token → show confirmation modal → confirm → `useDeleteToken()` → mutates SWR cache → re-fetches token list

## 4. Component Specifications

### 4.1 AccessTokensView Component

**Props**:

```typescript
type AccessTokensViewProps = {
  username: string;
};
```

**Responsibilities**:

- Fetch tokens via `useUserTokens(username)`
- Filter to `token_type === 'user'`
- Sort by `created` (most recent first)
- Handle loading and error states
- Only render if there are user tokens (component should not be rendered if empty)
- Render list of `AccessTokenItem` components

**States**:

- Loading: Show skeleton or spinner
- Error: Show error message
- Success: Render token list

**Styling**:

- Rounded rectangle with thin outline
- Background: page color (transparent or inherit)
- Border: 1px solid, use `--color-primary` from rubin-style-dictionary
- Border radius: use design token for rounded corners

### 4.2 AccessTokenItem Component

**Props**:

```typescript
type AccessTokenItemProps = {
  token: TokenInfo;
  username: string;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: Error) => void;
};
```

**Layout (Desktop - CSS Grid)**:

```
┌─────────────────────────────────────────────────────┐
│ token_name (bold)              Expires on YYYY-MM-DD│
│ gt-abc123... (small, mono, gray)                    │
│ scope1, scope2, scope3         Last used YYYY-MM-DD │
│                                           [Delete]  │
└─────────────────────────────────────────────────────┘
```

**Layout (Mobile - Modified Grid)**:

```
┌─────────────────────────────────┐
│ token_name (bold)               │
│ gt-abc123... (small)            │
│ scope1, scope2, scope3          │
│ Expires on YYYY-MM-DD [Delete]  │
│ Last used YYYY-MM-DD            │
└─────────────────────────────────┘
```

**Styling Details**:

- **Desktop (>768px)**:
  - Grid template columns: `1fr auto`
  - Grid template rows: `auto auto`
  - Grid areas: `info`, `expiry`, `lastused-delete`
- **Mobile (≤768px)**:
  - Grid template columns: `1fr auto`
  - Grid template rows: `auto auto auto auto auto`
  - Layout:
    - Rows 1-3: token_name, token key, scopes (span both columns)
    - Row 4: Expires (left), Delete button (right, rowspan 2, bottom-right aligned)
    - Row 5: Last used (left)
- Mobile breakpoint: 768px
- Border between items: `border-bottom: 1px solid` (use border color token)
- Token key: small font size, monospace, gray color
- All scopes shown, alphabetically sorted, comma-separated
- Delete button: tone=danger, appearance=outline, size=md
  - Desktop: right-aligned in its grid cell
  - Mobile: bottom-right aligned in its grid cell (using `align-self: end` and `justify-self: end`)

### 4.3 DeleteTokenModal Component

**Props**:

```typescript
type DeleteTokenModalProps = {
  isOpen: boolean;
  tokenName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
};
```

**Content**:

- **Title**: "Are you sure you want to delete this token?"
- **Body**: "Any applications using access token {tokenName} will stop working until you provide a new token. This action cannot be undone."
- **Buttons**:
  - Cancel button (secondary)
  - "Delete token" button (danger, shows loading state when `isDeleting=true`)

**Behavior**:

- Loading state shown on "Delete token" button while API request is in progress
- Modal cannot be dismissed while deleting

### 4.4 useDeleteToken Hook

**API**:

```typescript
type UseDeleteTokenReturn = {
  deleteToken: (username: string, key: string) => Promise<void>;
  isDeleting: boolean;
  error: Error | null;
};

function useDeleteToken(): UseDeleteTokenReturn;
```

**Implementation**:

- Fetches CSRF token from `useLoginInfo()`
- Makes DELETE request to `/auth/api/v1/users/${username}/tokens/${key}` with CSRF header
- Handles response codes: 204 (success), 401, 403, 404, 422
- Mutates `useUserTokens` cache on success
- Returns loading state and error

### 4.5 Date Formatting Utilities

**Functions**:

```typescript
function formatExpiration(expires: number | null): string;
// Returns: "Never expires" | "Expires on YYYY-MM-DD" | "Expires in X hours/days"

function formatLastUsed(lastUsed: number | null): string;
// Returns: "Never used" | "Last used YYYY-MM-DD" | "Last used X hours/days ago"
```

**Logic**:

- Uses `Date` constructor with epoch timestamps (seconds, not milliseconds)
- Threshold: 24 hours (86400 seconds)
- Relative formatting: use hours/days
- Absolute formatting: ISO date format (YYYY-MM-DD)

## 5. Page Implementation

**`/settings/tokens` Page**:

```typescript
// pages/settings/tokens.tsx
import { GetServerSideProps } from 'next';
import { loadAppConfig } from '@/lib/config/loader';
import useGafaelfawrUser from '@lsst-sqre/squared/hooks/useGafaelfawrUser';
import { getLoginUrl } from '@lsst-sqre/squared/lib/authUrls';
import AccessTokensView from '@/components/AccessTokensView';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { config: appConfig } = await loadAppConfig();

  return {
    props: {
      appConfig,
    },
  };
};

function TokensPage() {
  const { user, isLoggedIn, isLoading } = useGafaelfawrUser();

  // Handle authentication
  if (!isLoading && !isLoggedIn) {
    const loginUrl = getLoginUrl(window.location.href);
    window.location.href = loginUrl;
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Access Tokens</h1>
      <button>Create a token</button>
      {/* Only render AccessTokensView if there are user tokens */}
      <AccessTokensView username={user.username} />
    </div>
  );
}
```

## 6. Delete Functionality Flow

**User Flow**:

1. User clicks "Delete" button on a token item
2. `DeleteTokenModal` opens with confirmation message
3. User clicks "Delete token" button in modal
4. Button shows loading state (`isDeleting=true`)
5. Hook calls DELETE endpoint with CSRF token
6. On success (204):
   - Modal closes
   - Mutate `useUserTokens` cache
   - Token disappears from list
   - If no user tokens remain, `AccessTokensView` unmounts
7. On error:
   - Show error message inline in token item
   - Modal closes
   - Errors: 401 (re-auth), 403 (no permission), 404 (not found), 422 (validation)

## 7. Error Handling

**API Errors**:

- 401: "Authentication required. Please log in again."
- 403: "You don't have permission to delete this token."
- 404: "Token not found. It may have already been deleted."
- 422: "Invalid request. Please try again."
- Network errors: "Failed to delete token. Please check your connection."

**Display Strategy**:

- Inline error message in AccessTokenItem (appears after modal closes)
- Error persists until user attempts another action or dismisses it

## 8. Authentication Flow

**On Page Load**:

1. `useGafaelfawrUser()` checks authentication status
2. If `isLoggedIn === false` and not loading:
   - Redirect to login page using `getLoginUrl(window.location.href)`
   - Login page will redirect back to `/settings/tokens` after authentication
3. If authenticated:
   - Extract `username` from `user` object
   - Pass to `AccessTokensView`

## 9. Testing Strategy

**Unit Tests**:

- `dateFormatters.test.ts`: Test all date formatting edge cases (null, relative, absolute)
- `useDeleteToken.test.ts`: Test delete hook with mocked fetch, CSRF token handling
- `DeleteTokenModal.test.tsx`: Test modal open/close, loading states, button clicks
- `AccessTokenItem.test.tsx`: Test rendering, modal triggering, date formatting
- `AccessTokensView.test.tsx`: Test filtering (user tokens only), sorting (by created), states

**Storybook Stories**:

- `AccessTokensView`: loading, error, with tokens (various dates)
- `AccessTokenItem`: various expiry states, never used, with multiple scopes
- `DeleteTokenModal`: default, loading state

**Integration Testing**:

- Manual browser testing with real API
- Test authentication redirect
- Test delete flow end-to-end
- Test responsive layouts (desktop/mobile)

## 10. Responsive Design

**Breakpoint**: 768px

- Desktop (>768px): CSS Grid with 2 columns (`1fr auto`) and 2 rows
- Mobile (≤768px): CSS Grid with 2 columns (`1fr auto`) and 5 rows
  - Top 3 rows: full-width elements (token_name, token key, scopes span both columns)
  - Bottom 2 rows: Expires/Last used on left, Delete button on right (spanning both rows)

**CSS Media Query**:

```css
@media (max-width: 768px) {
  .tokenItem {
    grid-template-rows: auto auto auto auto auto;
  }

  /* First 3 rows span both columns */
  .tokenName,
  .tokenKey,
  .scopes {
    grid-column: 1 / -1;
  }

  /* Delete button spans 2 rows and aligns to bottom-right */
  .deleteButton {
    grid-row: span 2;
    align-self: end;
    justify-self: end;
  }
}
```

## 11. Design Tokens Usage

**Colors**:

- Primary color: `var(--color-primary)` - for container outline
- Border color: Use existing border token or lighter variant
- Text colors: Use existing text color tokens (primary, secondary, disabled)
- Gray for token key: Use muted/disabled text color token

**Typography**:

- Token name: Bold weight
- Token key: Small size, monospace font
- Dates: Regular weight, right-aligned
- Scopes: Regular weight

**Spacing**:

- Use consistent padding/margin tokens from rubin-style-dictionary
- Token item padding: Medium spacing token
- Gap between elements: Small spacing token

**Border Radius**:

- Container: Use rounded corner token (e.g., `var(--border-radius-md)`)

## 12. Implementation Steps

### Phase 1: Utilities & Hooks

1. **Create date formatting utilities** (`dateFormatters.ts` + tests)
2. **Create useDeleteToken hook** (+ tests)

### Phase 2: Components (Bottom-Up)

3. **Create DeleteTokenModal component** (+ CSS Module + stories + tests)
4. **Create AccessTokenItem component** (+ CSS Module + stories + tests)
5. **Create AccessTokensView component** (+ CSS Module + stories + tests)

### Phase 3: Page Integration

6. **Create /settings/tokens page** (+ getServerSideProps + authentication flow)
7. **Integration testing** (manual testing in browser)

### Phase 4: Validation

8. **Run format**: `pnpm format`
9. **Run lint**: `pnpm lint --filter squareone`
10. **Run type-check**: `pnpm type-check --filter squareone`
11. **Run tests**: `pnpm test --filter squareone`
12. **Run build**: `pnpm build --filter squareone`

## 13. Key Implementation Notes

### CSS Modules Pattern

- Use CSS Modules for all styling (`.module.css` files)
- Import styles as: `import styles from './Component.module.css'`
- Use design tokens from rubin-style-dictionary via CSS custom properties
- Class naming: camelCase (e.g., `tokenItem`, `deleteButton`)

### Token Filtering & Sorting

```typescript
const userTokens = tokens
  ?.filter((token) => token.token_type === 'user')
  .sort((a, b) => {
    // Most recent first (created is optional, handle nulls)
    const aCreated = a.created ?? 0;
    const bCreated = b.created ?? 0;
    return bCreated - aCreated;
  });
```

### Empty State Handling

```typescript
// In tokens.tsx page
{
  userTokens && userTokens.length > 0 && (
    <AccessTokensView username={user.username} />
  );
}
```

### CSRF Token Handling

```typescript
// In useDeleteToken
const { loginInfo } = useLoginInfo();
const csrfToken = loginInfo?.csrf;

// In DELETE request
headers: {
  'X-CSRF-Token': csrfToken,
}
```

### Modal State Management

```typescript
// In AccessTokenItem
const [isModalOpen, setIsModalOpen] = useState(false);
const { deleteToken, isDeleting, error } = useDeleteToken();

const handleDelete = () => setIsModalOpen(true);
const handleConfirm = async () => {
  await deleteToken(username, token.token);
  setIsModalOpen(false);
};
const handleCancel = () => setIsModalOpen(false);
```

## 14. Dependencies

**Existing**:

- `useUserTokens` hook (already exists)
- `useLoginInfo` hook (already exists)
- `useGafaelfawrUser` hook (already exists in squared)
- `getLoginUrl` utility (already exists in squared)
- Design tokens from `@lsst-sqre/rubin-style-dictionary`

**New**:

- Date formatting utilities
- Delete token hook
- Modal component
- Token item component
- Container component

## 15. Accessibility Considerations

- Modal should trap focus while open
- Modal should close on Escape key
- Delete button should have proper ARIA labels
- Loading states should be announced to screen readers
- Error messages should have proper ARIA roles
- Keyboard navigation should work throughout

## 16. Success Criteria

✅ User can view their access tokens at `/settings/tokens` ✅ Only tokens with `token_type === 'user'` are displayed ✅ Tokens are sorted by creation date (most recent first) ✅ Token details are displayed correctly (name, key, scopes, dates) ✅ Dates format correctly (relative vs absolute based on 24-hour threshold) ✅ Responsive layout works on desktop and mobile ✅ User can delete a token with confirmation modal ✅ Delete shows loading state during API request ✅ Token list updates after successful deletion ✅ Error messages display for failed deletions ✅ Unauthenticated users are redirected to login ✅ All tests pass (unit, component, Storybook) ✅ Code passes format, lint, and type-check ✅ Build succeeds

## 17. Future Enhancements (Out of Scope)

- Token creation flow (already implemented separately)
- Token editing/modification
- Token usage analytics/graphs
- Token search/filtering
- Export token list
- Bulk delete operations
