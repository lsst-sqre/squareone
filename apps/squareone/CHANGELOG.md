# squareone

## 0.26.0

### Minor Changes

- [#205](https://github.com/lsst-sqre/squareone/pull/205) [`362b05ea70a859f982c01fd129328d126816dfba`](https://github.com/lsst-sqre/squareone/commit/362b05ea70a859f982c01fd129328d126816dfba) Thanks [@jonathansick](https://github.com/jonathansick)! - Adopted @storybook/addon-vitest for improved testing performance and browser-based testing

  - Run `pnpm test-storybook` to execute Storybook tests using Vitest

- [#208](https://github.com/lsst-sqre/squareone/pull/208) [`f6c8b474823fa07ed0940205858cd209bf67f2a6`](https://github.com/lsst-sqre/squareone/commit/f6c8b474823fa07ed0940205858cd209bf67f2a6) Thanks [@jonathansick](https://github.com/jonathansick)! - Fixed hydration mis-match warnings with the UserMenu

- [#208](https://github.com/lsst-sqre/squareone/pull/208) [`f6c8b474823fa07ed0940205858cd209bf67f2a6`](https://github.com/lsst-sqre/squareone/commit/f6c8b474823fa07ed0940205858cd209bf67f2a6) Thanks [@jonathansick](https://github.com/jonathansick)! - Add comprehensive sidebar layout system and settings pages

  - **New sidebar navigation page layout::**

    - `SidebarLayout`: Responsive layout component with mobile-first design, CSS Grid on desktop, and flexbox on mobile
    - `MobileMenuToggle`: Hamburger menu component with accessibility features and smooth animations
    - `Sidebar`: Navigation sidebar with sticky positioning and structured navigation sections
    - `SidebarNavItem`: Individual navigation items with hover, active, and focus states
    - `SidebarNavSection`: Grouped navigation with optional section labels

  - **Settings pages implementation:**
    - `SettingsLayout`: Settings-specific layout using the sidebar system with dynamic navigation
    - Pages: Account (`/settings/`), and Access Tokens (`/settings/tokens`)
    - Complete server-side rendering with proper `getServerSideProps` implementation

- [#210](https://github.com/lsst-sqre/squareone/pull/210) [`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb) Thanks [@jonathansick](https://github.com/jonathansick)! - Configure Next.js to transpile squared package

  Added the @lsst-sqre/squared package to Next.js transpilePackages configuration to support the new build system that exports TypeScript source directly.

- [#220](https://github.com/lsst-sqre/squareone/pull/220) [`43a98d2009568d1b1b4f7d2fa2c641fcb6c18374`](https://github.com/lsst-sqre/squareone/commit/43a98d2009568d1b1b4f7d2fa2c641fcb6c18374) Thanks [@jonathansick](https://github.com/jonathansick)! - Add comprehensive token change history viewing

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
  - Local timezone support with ISO 8601 format for all timestamps
  - Graceful handling of deleted tokens (shows history even when token no longer exists)
  - Responsive design with proper loading and error states
  - Comprehensive test coverage for all components and hooks

  This feature provides complete visibility into token lifecycle events, helping users understand token usage patterns and security-relevant changes.

- [#216](https://github.com/lsst-sqre/squareone/pull/216) [`7238f2ede9e3c1838311bea84d2c3c065be2ad13`](https://github.com/lsst-sqre/squareone/commit/7238f2ede9e3c1838311bea84d2c3c065be2ad13) Thanks [@jonathansick](https://github.com/jonathansick)! - Add comprehensive token creation workflow

  Implements a full-featured token creation system including:

  - New `/settings/tokens/new` page with form interface
  - Token name validation to prevent duplicates
  - Scope selection with configurable available scopes
  - Flexible expiration options (preset durations and custom dates)
  - Query parameter support for pre-filling form values from URL templates
  - Integration with Gafaelfawr token API for token creation
  - Success modal displaying newly created tokens with copy functionality
  - Enhanced navigation with "Access Tokens" link in settings

  This feature enables users to create personal access tokens with appropriate scopes and expiration settings through a guided interface.

- [#220](https://github.com/lsst-sqre/squareone/pull/220) [`43a98d2009568d1b1b4f7d2fa2c641fcb6c18374`](https://github.com/lsst-sqre/squareone/commit/43a98d2009568d1b1b4f7d2fa2c641fcb6c18374) Thanks [@jonathansick](https://github.com/jonathansick)! - Add token details page and enhance token management UI

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

- [#217](https://github.com/lsst-sqre/squareone/pull/217) [`8c5de054db869e7d02942e6c23ceaccab4f260bc`](https://github.com/lsst-sqre/squareone/commit/8c5de054db869e7d02942e6c23ceaccab4f260bc) Thanks [@jonathansick](https://github.com/jonathansick)! - Add token viewing and deletion functionality

  Implements comprehensive token management capabilities including:

  - New AccessTokensView component displaying user's existing tokens
  - AccessTokenItem component with semantic HTML time elements for dates
  - Token deletion workflow with confirmation modal
  - useDeleteToken hook for API integration with Gafaelfawr
  - Date formatting utilities with relative time display
  - Integration into `/settings/tokens` page alongside token creation
  - Proper handling of undefined/null token fields from API

  Users can now view their existing access tokens, see expiration and last-used dates, and delete tokens through a confirmation workflow. The interface provides clear visual feedback and follows the application's design system.

### Patch Changes

- Updated dependencies [[`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb), [`9b6312854eee408a687b8c77978833032773934e`](https://github.com/lsst-sqre/squareone/commit/9b6312854eee408a687b8c77978833032773934e), [`024b11f8653bb1ade38240f890d8fbbb02aa0841`](https://github.com/lsst-sqre/squareone/commit/024b11f8653bb1ade38240f890d8fbbb02aa0841), [`7238f2ede9e3c1838311bea84d2c3c065be2ad13`](https://github.com/lsst-sqre/squareone/commit/7238f2ede9e3c1838311bea84d2c3c065be2ad13), [`0baaffd667f8d53aeb2963f36371415516b2c0ff`](https://github.com/lsst-sqre/squareone/commit/0baaffd667f8d53aeb2963f36371415516b2c0ff), [`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb), [`c85b08254b7bc14688b9f889541962a0a0d511b4`](https://github.com/lsst-sqre/squareone/commit/c85b08254b7bc14688b9f889541962a0a0d511b4), [`4bdb71382f3c5a935a9309bd5e5cc32c8e2210e5`](https://github.com/lsst-sqre/squareone/commit/4bdb71382f3c5a935a9309bd5e5cc32c8e2210e5), [`362b05ea70a859f982c01fd129328d126816dfba`](https://github.com/lsst-sqre/squareone/commit/362b05ea70a859f982c01fd129328d126816dfba), [`7238f2ede9e3c1838311bea84d2c3c065be2ad13`](https://github.com/lsst-sqre/squareone/commit/7238f2ede9e3c1838311bea84d2c3c065be2ad13), [`514c4e752c0e6f3c35b58781d6584edd22de366a`](https://github.com/lsst-sqre/squareone/commit/514c4e752c0e6f3c35b58781d6584edd22de366a), [`5de611d8d5a4ebf5677241982d6932e5e2aa77d1`](https://github.com/lsst-sqre/squareone/commit/5de611d8d5a4ebf5677241982d6932e5e2aa77d1), [`3396e84b11d375679f9e93e12367e9b32c865cfd`](https://github.com/lsst-sqre/squareone/commit/3396e84b11d375679f9e93e12367e9b32c865cfd), [`a9e269c52e9259afd8657ca0c784b1aa966f0b27`](https://github.com/lsst-sqre/squareone/commit/a9e269c52e9259afd8657ca0c784b1aa966f0b27), [`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb), [`e28bd8c294249c99d12af40d36fc8bd93cc9b9e4`](https://github.com/lsst-sqre/squareone/commit/e28bd8c294249c99d12af40d36fc8bd93cc9b9e4), [`c85b08254b7bc14688b9f889541962a0a0d511b4`](https://github.com/lsst-sqre/squareone/commit/c85b08254b7bc14688b9f889541962a0a0d511b4)]:
  - @lsst-sqre/squared@0.9.0
  - @lsst-sqre/rubin-style-dictionary@0.6.0
  - @lsst-sqre/global-css@0.2.3

## 0.25.0

### Minor Changes

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Next.js to version 15.5.0

  This is a major version upgrade from Next.js 14.x to 15.5.0, which includes:

  - New App Router improvements and features (although Squareone remains on the pages router)
  - Breaking changes in build system and runtime behavior (turbopack)
  - Updated instrumentation configuration
  - Performance improvements

  This upgrade may require configuration updates in consuming applications.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Node.js to version 22.13.0 LTS

  Updated the Node.js runtime requirement from 18.x to 22.x LTS, which includes:

  - Latest LTS stability and security improvements
  - Updated build toolchain and CI environment
  - Improved performance and new language features

  This change updates the development environment and deployment requirements.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade React to version 19.1.1

  This is a major version upgrade from React 18.x to React 19.1.1, which includes:

  - New React 19 features and improvements
  - Updated TypeScript types for React 19
  - Breaking changes that may affect consumers

  This upgrade requires peer dependency updates in consuming applications.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Storybook to version 9.1.3

  This is a major version upgrade from Storybook 7.x to 9.1.3, which includes:

  - New Storybook 9 features and testing capabilities
  - Updated addon ecosystem and configuration
  - Breaking changes in story format and testing utilities
  - Improved performance and build system
  - Migration from deprecated addons to new alternatives

  This upgrade includes configuration changes and may require story updates in consuming projects.

### Patch Changes

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix build system and Storybook compatibility issues

  - Fix Turbo build outputs configuration for better caching
  - Add explicit React imports to Storybook files for CI compatibility
  - Fix ESLint compatibility with Turbo 2.5.6
  - Resolve Docker build corepack signature errors
  - Update build timeouts and pass required environment variables

  These changes improve build reliability and resolve compatibility issues in CI environments.

- Updated dependencies [[`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac)]:
  - @lsst-sqre/squared@0.8.0

## 0.24.0

### Minor Changes

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`410c0329d2915b61763937977dd9e3a5c7a5e60c`](https://github.com/lsst-sqre/squareone/commit/410c0329d2915b61763937977dd9e3a5c7a5e60c) Thanks [@jonathansick](https://github.com/jonathansick)! - MDX content is now sourced from individual files, rather than as keys in the app configuration. The files are named after the page they correspond to. The MDX content directory is flat, with `__` standing in for a path separator. The directory that MDX is sourced from is configured via the mdxDir field in the configuration YAML.

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`410c0329d2915b61763937977dd9e3a5c7a5e60c`](https://github.com/lsst-sqre/squareone/commit/410c0329d2915b61763937977dd9e3a5c7a5e60c) Thanks [@jonathansick](https://github.com/jonathansick)! - Replaced next/config and getInitialProps with AppConfigContext that is loaded from getServerSideProps. Individual components can now access configuration from the useAppConfig hook.

  - Moved the client-side Sentry configuration to `_app.tsx` so that it can use the AppConfigContext. Previously it was loaded directly in the `instrumentation-client.js` hook that didn't have access to the app configuration.

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`c92f852908b16a8b429d9b616dfdcbb759de99ce`](https://github.com/lsst-sqre/squareone/commit/c92f852908b16a8b429d9b616dfdcbb759de99ce) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated Squareone to Typescript and Next.js 14!

  - Adopted the SWC compiler, replacing Babel, for improved performance and compatibility. This change preserves ES modules.
  - Updated TypeScript target to ES2017 and enabled strict type checking.
  - Updated SWR to v2.3.6.
  - Updated next-mdx-remote to v5.

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`410c0329d2915b61763937977dd9e3a5c7a5e60c`](https://github.com/lsst-sqre/squareone/commit/410c0329d2915b61763937977dd9e3a5c7a5e60c) Thanks [@jonathansick](https://github.com/jonathansick)! - Resolved server-side rendering (SSR) issues that were exposed by the TypeScript migration and new tree shaking:

  - Improved next-mdx-remote usage by ensuring that the `serialize` function is called from `getServerSideProps`.
  - Improved swr usage by segreagating it into client-side components that are dynamically imported.

### Patch Changes

- Updated dependencies [[`2b7c98f0bd660714e7f0c50635277664723f4fd5`](https://github.com/lsst-sqre/squareone/commit/2b7c98f0bd660714e7f0c50635277664723f4fd5), [`2b7c98f0bd660714e7f0c50635277664723f4fd5`](https://github.com/lsst-sqre/squareone/commit/2b7c98f0bd660714e7f0c50635277664723f4fd5)]:
  - @lsst-sqre/squared@0.7.0

## 0.23.0

### Minor Changes

- [`b41e337e5517caa3332ad78d5ee62fc96d1f13fc`](https://github.com/lsst-sqre/squareone/commit/b41e337e5517caa3332ad78d5ee62fc96d1f13fc) Thanks [@jonathansick](https://github.com/jonathansick)! - Update to Next 13.5

- [`4129cd39404ff5d14cd3716fbd526839f851b50e`](https://github.com/lsst-sqre/squareone/commit/4129cd39404ff5d14cd3716fbd526839f851b50e) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate components to use transitive props for styled-components.

- [`1d320df1a52dabda5b29f36715a4ab9d5eb92d1f`](https://github.com/lsst-sqre/squareone/commit/1d320df1a52dabda5b29f36715a4ab9d5eb92d1f) Thanks [@jonathansick](https://github.com/jonathansick)! - Update Sentry SDK to v10 and adopt instrumentation.ts configuration.

- [`a833b03b174e7d3e3c07b9bd86fe14fc80d25bcf`](https://github.com/lsst-sqre/squareone/commit/a833b03b174e7d3e3c07b9bd86fe14fc80d25bcf) Thanks [@jonathansick](https://github.com/jonathansick)! - Downgrade to Node 18.18.0 for better compatiblity with Next 12 and 13.

### Patch Changes

- [`fbcd10ea21883f1652dd0839a0573bc235e4edf4`](https://github.com/lsst-sqre/squareone/commit/fbcd10ea21883f1652dd0839a0573bc235e4edf4) Thanks [@jonathansick](https://github.com/jonathansick)! - Fixed the storybook build.

- Updated dependencies [[`b41e337e5517caa3332ad78d5ee62fc96d1f13fc`](https://github.com/lsst-sqre/squareone/commit/b41e337e5517caa3332ad78d5ee62fc96d1f13fc), [`4129cd39404ff5d14cd3716fbd526839f851b50e`](https://github.com/lsst-sqre/squareone/commit/4129cd39404ff5d14cd3716fbd526839f851b50e)]:
  - @lsst-sqre/squared@0.6.0

## 0.22.0

### Minor Changes

- [#192](https://github.com/lsst-sqre/squareone/pull/192) [`50d8d1f6cfef0318cb6c2767ba4feda8e120e348`](https://github.com/lsst-sqre/squareone/commit/50d8d1f6cfef0318cb6c2767ba4feda8e120e348) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate to React 18.3.1

  - Updated React from 17.0.2 to 18.3.1 across all packages
  - Updated React DOM to 18.3.1 for improved hydration and performance
  - Updated TypeScript types for React 18 compatibility
  - Updated styled-components to v5.3.11 for React 18 support
  - Updated Storybook React dependencies for compatibility

### Patch Changes

- [#192](https://github.com/lsst-sqre/squareone/pull/192) [`4d6a727f17ce694b75cdfae1318cb77d78e40dc7`](https://github.com/lsst-sqre/squareone/commit/4d6a727f17ce694b75cdfae1318cb77d78e40dc7) Thanks [@jonathansick](https://github.com/jonathansick)! - Modernize Dockerfile syntax

- Updated dependencies [[`50d8d1f6cfef0318cb6c2767ba4feda8e120e348`](https://github.com/lsst-sqre/squareone/commit/50d8d1f6cfef0318cb6c2767ba4feda8e120e348)]:
  - @lsst-sqre/squared@0.5.0

## 0.21.1

### Patch Changes

- [#190](https://github.com/lsst-sqre/squareone/pull/190) [`72971e97efef450f755238803ae125876f2021b9`](https://github.com/lsst-sqre/squareone/commit/72971e97efef450f755238803ae125876f2021b9) Thanks [@jonathansick](https://github.com/jonathansick)! - Update Next to 12.3.5

- [#190](https://github.com/lsst-sqre/squareone/pull/190) [`19087e3c5c18d243c0bf7a10da02c3f60127c99e`](https://github.com/lsst-sqre/squareone/commit/19087e3c5c18d243c0bf7a10da02c3f60127c99e) Thanks [@jonathansick](https://github.com/jonathansick)! - Downgraded Sentry SDK from v8 to v7 for compatibility with Next.js 12.3.5.

- [#190](https://github.com/lsst-sqre/squareone/pull/190) [`19087e3c5c18d243c0bf7a10da02c3f60127c99e`](https://github.com/lsst-sqre/squareone/commit/19087e3c5c18d243c0bf7a10da02c3f60127c99e) Thanks [@jonathansick](https://github.com/jonathansick)! - Added filtering in next.config.js to remove deprecated configuration properties that Sentry SDK adds but Next.js 12.3.5 doesn't recognize.

## 0.21.0

### Minor Changes

- [#188](https://github.com/lsst-sqre/squareone/pull/188) [`d24e59837c7c8057b03ea8d42d625e64e6fc5d0e`](https://github.com/lsst-sqre/squareone/commit/d24e59837c7c8057b03ea8d42d625e64e6fc5d0e) Thanks [@jonathansick](https://github.com/jonathansick)! - Add new "notice" and "outage" broadcast banners. This notice category replaces the earlier default ("maintenance") and is orange. Another new category, "outage", takes the red colour. This change is driven by Semaphore at https://github.com/lsst-sqre/semaphore/pull/109

### Patch Changes

- Updated dependencies [[`7a41984e02439cd16a2786196330492197f5c465`](https://github.com/lsst-sqre/squareone/commit/7a41984e02439cd16a2786196330492197f5c465)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.1
  - @lsst-sqre/global-css@0.2.2
  - @lsst-sqre/squared@0.4.2

## 0.20.0

### Minor Changes

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`1dc078011cb6a1e87fbde6480ebbdf534c5ea9ee`](https://github.com/lsst-sqre/squareone/commit/1dc078011cb6a1e87fbde6480ebbdf534c5ea9ee) Thanks [@jonathansick](https://github.com/jonathansick)! - Adopt horizontal triad logo in header.

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`55df20028a802a7dcd33b14d599266517c05021a`](https://github.com/lsst-sqre/squareone/commit/55df20028a802a7dcd33b14d599266517c05021a) Thanks [@jonathansick](https://github.com/jonathansick)! - Update pnpm to 10.12.

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`c1bc9f3e517c5273588b21dd0368411575c6684d`](https://github.com/lsst-sqre/squareone/commit/c1bc9f3e517c5273588b21dd0368411575c6684d) Thanks [@jonathansick](https://github.com/jonathansick)! - Update funding notice text.

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`755428a010d4355994436b02dfb9a55801438ab7`](https://github.com/lsst-sqre/squareone/commit/755428a010d4355994436b02dfb9a55801438ab7) Thanks [@jonathansick](https://github.com/jonathansick)! - Use configured site name for homepage title.

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`10153b02ea62674a75b8c33acdff88351e8d2511`](https://github.com/lsst-sqre/squareone/commit/10153b02ea62674a75b8c33acdff88351e8d2511) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a configurable preview badge that links to the roadmap doc.

  The preview badge appears on the homepage below the title. It's presence is configurable with the "showPreview" configuration. The link it follows is also configurable with "previewLink".

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`13e1fdce47cafe848413d5aa78e51cc767fda365`](https://github.com/lsst-sqre/squareone/commit/13e1fdce47cafe848413d5aa78e51cc767fda365) Thanks [@jonathansick](https://github.com/jonathansick)! - Update to Node 22.16 (current LTS).

### Patch Changes

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`9b717643a038f3936f520c2f85dfaa2d7ad2b0d3`](https://github.com/lsst-sqre/squareone/commit/9b717643a038f3936f520c2f85dfaa2d7ad2b0d3) Thanks [@jonathansick](https://github.com/jonathansick)! - Update partner logo lineup.

- Updated dependencies [[`9b717643a038f3936f520c2f85dfaa2d7ad2b0d3`](https://github.com/lsst-sqre/squareone/commit/9b717643a038f3936f520c2f85dfaa2d7ad2b0d3), [`1323de7a7e4deb3ada11ebbf650883c70221958f`](https://github.com/lsst-sqre/squareone/commit/1323de7a7e4deb3ada11ebbf650883c70221958f)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.0
  - @lsst-sqre/global-css@0.2.1
  - @lsst-sqre/squared@0.4.1

## 0.19.0

### Minor Changes

- [#183](https://github.com/lsst-sqre/squareone/pull/183) [`a1a6cbe`](https://github.com/lsst-sqre/squareone/commit/a1a6cbeb77af55cc5c7a2c9c09310a565f4db290) Thanks [@jonathansick](https://github.com/jonathansick)! - Times Square now supports date and date-time parameter types.

## 0.18.0

### Minor Changes

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`92ecf5f`](https://github.com/lsst-sqre/squareone/commit/92ecf5f1b3d4e509552e1cb724cfb8dfd63efa45) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a configurable Apps menu to the header navigation. This menu is for linking for non-aspect applications within the RSP, such as Times Square.

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`b4b2fdb`](https://github.com/lsst-sqre/squareone/commit/b4b2fdb72ea42adf3142ee53bdb463e9bfebe441) Thanks [@jonathansick](https://github.com/jonathansick)! - Moved auth URLs into Squared as a library. The `getLoginUrl` and `getLogout` URL functions compute the full URLs to the RSP's login and logout endpoints and include the `?rd` query strings to return the user to current and home URL respectively.

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`6be6b1c`](https://github.com/lsst-sqre/squareone/commit/6be6b1c5229444e293d0d1e84a263c499202934d) Thanks [@jonathansick](https://github.com/jonathansick)! - Reimplement `HeaderNav` using the `PrimaryNavigation` component from Squared. Although the menu looks the same visually, it is now entirely powered by the Radix `NavigationMenu` primitive so that any menu item can be a trigger for a menu rather than a link to another page. The Login / user menu is reimplemented as a menu item rather than with the special GafaelfawrUserMenu component.

### Patch Changes

- Updated dependencies [[`b4b2fdb`](https://github.com/lsst-sqre/squareone/commit/b4b2fdb72ea42adf3142ee53bdb463e9bfebe441), [`77274e7`](https://github.com/lsst-sqre/squareone/commit/77274e7a144158ac267f4b38a1e7dc48cb10f2de)]:
  - @lsst-sqre/squared@0.4.0

## 0.17.0

### Minor Changes

- [#175](https://github.com/lsst-sqre/squareone/pull/175) [`9cadf35`](https://github.com/lsst-sqre/squareone/commit/9cadf358e89410e475222e8a76a9e20056cf6119) Thanks [@jonathansick](https://github.com/jonathansick)! - The Times Square UI now closes its connection to the `/times-square/pages/:page/html/events?<qs>` SSE endpoint once the page instance's execution status is "complete" and the HTML hash is computed. With this change, the Times Square UI reduces its ongoing load on the API and also reduces network usage. The HTML page will still update to the latest version because the iframe component pings the Times Square `pages/:page/htmlstatus?<qs>` endpoint. We may back this off or convert the page update to an opt-in future in the future to further reduce network and API load from the front-end.

## 0.16.0

### Minor Changes

- [#176](https://github.com/lsst-sqre/squareone/pull/176) [`8e5b789`](https://github.com/lsst-sqre/squareone/commit/8e5b789ab0b4c591cca1f42db0e6cf773d8b0ccc) Thanks [@fajpunk](https://github.com/fajpunk)! - Added Sentry instrumentation to the `squareone` app.

  Both the NextJS client (frontend) and server (backend) code are instrumented with the official [Sentry NextJS integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/). The Sentry DSN should be provided in a `SENTRY_DSN` environment variable. If a Sentry DSN is not provided, there will be no changes to app behaviour. If a Sentry DSN is provided, then these things will be sent to Sentry:

  - Any uncaught exceptions and error-level logs
  - Traces for user interaction (according to the sample settings)
  - Session replays for user interaction (according to the sample settings)

  There are new config file options for Sentry configuration:

  - `sentryTracesSampleRate`
  - `sentryReplaysSessionSampleRate`
  - `sentryReplaysOnErrorSampleRate`
  - `sentryDebug`

  There is a new route, `/sentry-example-page` which provides a way to quickly check that the Sentry integration is working.

## 0.15.0

### Minor Changes

- [#173](https://github.com/lsst-sqre/squareone/pull/173) [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd) Thanks [@jonathansick](https://github.com/jonathansick)! - The Times Square interface now includes a link to its user documentation. The root of the environment-specific rsp.lsst.io site is configured through the new `docsBaseUrl` configuration parameter.

- [#173](https://github.com/lsst-sqre/squareone/pull/173) [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated Squareone CSS custom properties / design tokens to global-css from the globals.css file in the Squareone app

  With this change, any app as well as the Squared component library can use CSS custom properties such as the elevations (box-shadows, e.g. `--sqo-elevation-md`) and transitions (`--sqo-transition-basic`) that are included as global CSS custom properties.

### Patch Changes

- Updated dependencies [[`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd), [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd)]:
  - @lsst-sqre/squared@0.3.0
  - @lsst-sqre/global-css@0.2.0

## 0.14.0

### Minor Changes

- [#171](https://github.com/lsst-sqre/squareone/pull/171) [`55ff9ab`](https://github.com/lsst-sqre/squareone/commit/55ff9ab52dc86c3b47f5ac4ca2fb5fc84d9ff15b) Thanks [@jonathansick](https://github.com/jonathansick)! - Add support for Plausible.io analytics

  In Squareone, set the `plausibleDomain` configuration to the Plausible tracking domain. E.g. data.lsst.cloud for the RSP. To disable Plausible tracking where it isn't supported, set this configuration to `null`.

## 0.13.1

### Patch Changes

- [#169](https://github.com/lsst-sqre/squareone/pull/169) [`c4eeb75`](https://github.com/lsst-sqre/squareone/commit/c4eeb75c85f290165313c2f9a7bc4cd814710a6c) Thanks [@jonathansick](https://github.com/jonathansick)! - Change "Account settings" menu item to title case.

## 0.13.0

### Minor Changes

- [#166](https://github.com/lsst-sqre/squareone/pull/166) [`157d03d`](https://github.com/lsst-sqre/squareone/commit/157d03db4fe3e559dc0071c1a1567200d376e1be) Thanks [@jonathansick](https://github.com/jonathansick)! - Usage of Reach UI is now removed and replaced with Radix UI. The user menu now uses `GafaelfawrUserMenu` from `@lsst-sqre/squared` and is based on Radix UI's Navigation Menu component. It is customized here to work with the Gafaelawr API to show a log in button for the logged out state, and to show the user's menu with a default log out button for the logged in state. Previously we also used Reach UI for showing an accessible validation alert in the Times Square page parameters UI. For now we've dropped this functionality.

### Patch Changes

- Updated dependencies [[`157d03d`](https://github.com/lsst-sqre/squareone/commit/157d03db4fe3e559dc0071c1a1567200d376e1be), [`f403ffd`](https://github.com/lsst-sqre/squareone/commit/f403ffd461983a579614d1ae4aa2c4b42537c294)]:
  - @lsst-sqre/squared@0.2.0

## 0.12.0

### Minor Changes

- [#164](https://github.com/lsst-sqre/squareone/pull/164) [`0574c00`](https://github.com/lsst-sqre/squareone/commit/0574c00b63b49418a35b95379f05e291848d667e) Thanks [@jonathansick](https://github.com/jonathansick)! - Users can now download the Jupyter Notebook (ipynb) file that they are viewing, with the current parameters filled in. This enables further interactive exploration.

- [#164](https://github.com/lsst-sqre/squareone/pull/164) [`2adb0af`](https://github.com/lsst-sqre/squareone/commit/2adb0af63bb1a69e59f68a33a1a31bdf30899bb2) Thanks [@jonathansick](https://github.com/jonathansick)! - Times Square notebook pages show a link to the source notebook on GitHub.

## 0.11.0

### Minor Changes

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`3561d09`](https://github.com/lsst-sqre/squareone/commit/3561d097d0c5cbe508f140f2bcd9041a540832a0) Thanks [@jonathansick](https://github.com/jonathansick)! - Squareone uses a base stylesheet from the @lsst-sqre/global-css package. This reduces the amount of global CSS managed in Squareone itself, and offloads configuring the Rubin Style Dictionary tokens into base CSS elements.

- [#163](https://github.com/lsst-sqre/squareone/pull/163) [`72dd989`](https://github.com/lsst-sqre/squareone/commit/72dd989ad963612204fa92a484a56abfbed4df8a) Thanks [@jonathansick](https://github.com/jonathansick)! - Implement background recomputation for cached Times Square pages. The "Recompute" button submits a request to Times Square's `DELETE /v1/pages/:page/html?{params}` endpoint, which causes a background recomputation of the notebook and re-rendering of the cached HTML.

  The new `TimesSquareHtmlEventsProvider` is a React context provider that provides real-time updates from Times Square about the status of an HTML rendering for a given set of parameters using Times Square's `/v1/pages/:page/html/events/{params}` endpoint. Squareone uses `@microsoft/fetch-event-source` to subscribe to this server-sent events (SSE) endpoint. Using this provider, the UI is able to show new data to the user, including the status of the computation, and once the computation is complete, the date/age of computation and the execution time.

- [#163](https://github.com/lsst-sqre/squareone/pull/163) [`72dd989`](https://github.com/lsst-sqre/squareone/commit/72dd989ad963612204fa92a484a56abfbed4df8a) Thanks [@jonathansick](https://github.com/jonathansick)! - The Times Square "Update" and "Reset" buttons are now disabled when appropriate. The Update button is disabled when the parameter inputs have not been changed relative to their current state. Likewise, the Reset button is disabled when the parameters are unchanged from the current state.

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`1240924`](https://github.com/lsst-sqre/squareone/commit/124092414c191eb16866304eafd9b6c4d428e2f6) Thanks [@jonathansick](https://github.com/jonathansick)! - Drop the use of normalize.css and instead rely on the base CSS from the global-css package.

- [#163](https://github.com/lsst-sqre/squareone/pull/163) [`72dd989`](https://github.com/lsst-sqre/squareone/commit/72dd989ad963612204fa92a484a56abfbed4df8a) Thanks [@jonathansick](https://github.com/jonathansick)! - New `TimesSquareUrlParametersProvider` component. This React context provides the URL-based state to Times Square components, such as the page being viewed, its notebook parameters values, and the display settings. This change simplifies the structure of the React pages by refactoring all of the URL parsing into a common component. As well, this context eliminates "prop drilling" to provide this URL-based state to all components in the Times Square application.

### Patch Changes

- Updated dependencies [[`b765732`](https://github.com/lsst-sqre/squareone/commit/b765732db52e354026294fce7b5ef7c32d32e553), [`5ee421b`](https://github.com/lsst-sqre/squareone/commit/5ee421bdd8f1c6f922913028ad48284f941189f1), [`9abbebb`](https://github.com/lsst-sqre/squareone/commit/9abbebba02fc1bc27fe2097fbbdb97110a9c93d9), [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a), [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a)]:
  - @lsst-sqre/squared@0.1.0
  - @lsst-sqre/global-css@0.1.0

## 0.10.3

### Patch Changes

- [#150](https://github.com/lsst-sqre/squareone/pull/150) [`1bcd1a4`](https://github.com/lsst-sqre/squareone/commit/1bcd1a45610f64eeb88ebd4c49572a679b0767a5) Thanks [@jonathansick](https://github.com/jonathansick)! - The squareone Docker image release is now triggered by a GitHub Release being published.

## 0.10.2

### Patch Changes

- [#148](https://github.com/lsst-sqre/squareone/pull/148) [`0e4d392`](https://github.com/lsst-sqre/squareone/commit/0e4d392afafe8437f39af3018ecf47d4a76567a2) Thanks [@jonathansick](https://github.com/jonathansick)! - Tweaks to the release process:

  - Use a custom GITHUB_TOKEN for the changesets/action in order to trigger the Docker release workflow for Squareone.

- Updated dependencies [[`0e4d392`](https://github.com/lsst-sqre/squareone/commit/0e4d392afafe8437f39af3018ecf47d4a76567a2)]:
  - @lsst-sqre/rubin-style-dictionary@0.4.2

## 0.10.1

### Patch Changes

- [#143](https://github.com/lsst-sqre/squareone/pull/143) [`13e6f4c`](https://github.com/lsst-sqre/squareone/commit/13e6f4c4415e913665dd8922c0e079dd0fefe7ba) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated lsst-sqre/squareone into a turbo-based monorepo. Rubin Style Dictionary is now a package inside the monorepo.
- Migrated to `pnpm` from `npm` for package management.
- Upgrade to Storybook 7.
- Add development set up documentation to the squareone.lsst.io site.

- Updated dependencies [[`13e6f4c`](https://github.com/lsst-sqre/squareone/commit/13e6f4c4415e913665dd8922c0e079dd0fefe7ba)]:
  - @lsst-sqre/rubin-style-dictionary@0.4.1

## 0.10.0 (2023-03-27)

### New features

- Add new pages for the COmanage sign-up flow. The content for these pages is configurable via [MDX](https://mdxjs.com) fields in `squareone.config.yaml`:

  - `verifyEmailPageMdx` for `/enrollment/thanks-for-signing-up`
  - `emailVerifiedPageMdx` for `/enrollment/thanks-for-verifying`
  - `pendingApprovalPageMdx` for `/enrollment/pending-approval`
  - `pendingVerificationPageMdx` for `/enrollment/pending-confirmation`

- Other pages' content are now configurable with MDX:

  - `apiAspectPageMdx` for `/api-aspect`
  - `docsPageMdx` for `/docs`
  - `supportPageMdx` for `/support`

## 0.9.0 (2023-03-01)

### New features

- Display an "Account settings" link in the user menu that goes to the COmanage Registry. This registry URL, which is optional, can be configured in `squareone.config.yaml` with the `coManageRegistryUrl` field.

## 0.8.1 (2022-08-25)

### Bug fixes

- Improved UI for Times pull request preview pages.

### Development changes

- Added additional stories and integration with Chromatic, the hosted Storybook service.

## 0.8.0 (2022-08-18)

### New features

- New pages for Times Square to preview pages in GitHub pull requests at `/times-square/github-pr/:owner/:repo:/:commit` paths.

### Development changes

- Initial integration with Storybook for designing and documenting components within Squareone.

## 0.7.1 (2022-06-26)

### Bug fixes

- Link to DP0.2 documentation.

## 0.7.0 (2022-06-23)

### New features

- Add initial support for [Times Square](https://github.com/lsst-sqre/times-square).
- Update background image for the homepage hero component to a new image by Bruno Quint, taken September 2021.

### Development changes

- Refresh dependencies.

## 0.6.0 (2022-04-14)

### New features

- Informational broadcast messages are now displayed with Rubin's primary teal as the background color (see [lsst-sqre/semaphore#29](https://github.com/lsst-sqre/semaphore/pull/29) for more information).
- Replaced custom fetch hook for the Semaphore broadcast message data with swr, enabling us to automatically refresh broadcast data.
- Updated the component layout in the source code.

## 0.5.0 (2022-04-06)

### New features

- Squareone is cross-published on the GitHub Container Registry at `ghcr.io/lsst-sqre/squareone`.

### Bug fixes

- Fix minor UI issues, including unnecessary scrollbars in the broadcast message disclosures and `Link` usage.
- Remove the note on the documentation page about Generation 3 middleware.

### Development changes

- Upgrade to Next 12 and various upgrades of dependencies and linting tools.
- Upgrade to Node 16.

## 0.4.0 (2021-08-11)

### New features

- Broadcast messages are now sourced through `Semaphore <https://github/lsst-sqre/semaphore>`_, a service that is installed in the science platform and sources messages from GitHub. With this update, messages can also have additional information that is visible if a user clicks on a "Read more" button. This disclosure is powered by `react-a11y-disclosure <https://github.com/KittyGiraudel/react-a11y-disclosure>`_.

- There is a new configuration field, `semaphoreUrl`, to configure the root URL for the Semaphore API service. The `broadcastMarkdown` field is removed.

## 0.3.1 (2021-08-04)

### Bug fixes

- Update funding text.

### Development changes

- Refresh README with status badges and revise text on git hooks.

## 0.3.0 (2021-07-12)

### New features

- Add a broadcastMarkdown configuration field to the public configuration schema. If set, this content is shown in a new BroadcastBanner component on any page. This is a configuration-driven way of displaying notifications to users without requiring code changes. The semaphore application will add further flexibility for pushing notifications in the future.

### Bug fixes

- Fix the name of the GitHub repository for support on the `/support` page.

## 0.2.2 (2021-06-25)

### Bug fixes

- Revised capitalization in the Acceptable Use Policy.

## 0.2.1 (2021-06-24)

### Bug fixes

- Add description on how to use the auth token with TAP clients that rely on basic authentication (username and password).

## 0.2.0 (2021-06-24)

### New features

This release includes many features in preparation for DP0.1:

- New `/docs` page that links to data, service, and software documentation relevant to RSP users.
- New `/api`-aspect page that provides information about how to access the TAP API.
- New `/terms` page that includes the RSP Acceptable Use Policy
- New `/support` page that describes how to get support.

### Bug fixes

- Fix open graph metadata

## 0.1.5 (2021-05-06)

### Bug fixes

- Update funding agency text and logos to the operations era.

## 0.1.4 (2021-05-03)

### Bug fixes

- Fix CSS loading for the UserMenu component by adding the babel styled-components plugin.
- Change the UserMenu component to display the username rather than the user's name, as Gafaelfawr does not guarantee the "name" property is available.
- Switch to Font Source for the Source Sans font (from Google Fonts).
- Remove temporary content from the index page.

## 0.1.3 (2021-04-05)

### Bug fixes

- Fix hero links for Portal and Notebooks
- Enable links in nav bar
- Enable documentation links

## 0.1.2 (2021-04-05)

### Bug fixes

- Fix how the configuration path is computed.

## 0.1.1 (2021-04-05)

### Bug fixes

- This release adds next.config.js to the Docker image.

## 0.1.0 (2021-03-30)

### New features

This is the first development release of Squareone! 🎉
