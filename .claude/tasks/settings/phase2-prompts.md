# Phase 2: Settings Integration Implementation Plan

## Overview

This document provides detailed prompts for implementing the Settings integration using the SidebarLayout component. Each section represents an atomic change that should be committed separately.

## Prompt 1: Create Basic SettingsLayout Component

**Task:**
Create the SettingsLayout component that uses SidebarLayout with static navigation configuration. This component should:
- Use the generic SidebarLayout component
- Define static navigation for Settings pages
- Export a getLayout function for Next.js page integration
- Include TypeScript types

**Files to create:**
- `apps/squareone/src/components/SettingsLayout/index.ts`
- `apps/squareone/src/components/SettingsLayout/SettingsLayout.tsx`
- `apps/squareone/src/components/SettingsLayout/settingsNavigation.ts`

**Implementation notes:**
- Start with hardcoded navigation sections (no dynamic filtering yet)
- Navigation should include: Account (main /settings), Access Tokens, Sessions
- Title should be static "Settings" for now
- Export both the component and getLayout function

**Testing:**
Run these commands to verify the implementation:
```bash
pnpm lint --filter squareone
pnpm type-check --filter squareone
pnpm build --filter squareone
```

**Commit message:**
```
Add SettingsLayout component with static navigation

Create SettingsLayout component that wraps SidebarLayout with
settings-specific navigation configuration. Includes static
navigation items for Account, Access Tokens, and Sessions pages.
Exports getLayout function for Next.js page integration.
```

---

## Prompt 2: Add SettingsLayout Storybook Stories

**Task:**
Create comprehensive Storybook stories for the SettingsLayout component. Stories should demonstrate:
- Default layout with all navigation items
- Active state for different pages
- Mobile responsive behavior
- Proper styled-components integration

**Files to create:**
- `apps/squareone/src/components/SettingsLayout/SettingsLayout.stories.tsx`

**Implementation notes:**
- Use the AppConfigDecorator to provide mock config
- Create stories for each navigation item being active
- Include mobile viewport story
- Mock the Next.js router for active path detection

**Testing:**
```bash
pnpm storybook --filter squareone
```
Use Playwright MCP to navigate to http://localhost:6006 and visually verify:
- All navigation items are visible
- Active states work correctly
- Mobile menu toggle functions
- Responsive breakpoint at 60rem works

**Commit message:**
```
Add Storybook stories for SettingsLayout

Create comprehensive stories demonstrating SettingsLayout in
various states including different active pages and mobile
responsive behavior. Stories use AppConfigDecorator for proper
context setup and mock Next.js router for navigation testing.
```

---

## Prompt 3: Create Settings Pages with SSR

**Task:**
Create the three initial settings pages with proper server-side rendering setup. Each page must:
- Implement getServerSideProps to load appConfig
- Use the getLayout pattern from SettingsLayout
- Include h1 header and placeholder content
- Follow TypeScript patterns

**Files to create:**
- `apps/squareone/src/pages/settings/index.tsx` (Account page)
- `apps/squareone/src/pages/settings/tokens.tsx` (Access Tokens)
- `apps/squareone/src/pages/settings/sessions.tsx` (Sessions)

**Implementation notes:**
- Path /settings should show "Account" as h1
- Path /settings/tokens should show "Access Tokens" as h1  
- Path /settings/sessions should show "Sessions" as h1
- Each page needs lorem ipsum paragraph placeholder
- Must load appConfig in getServerSideProps for layout to work
- Use NextPageWithLayout type from _app.tsx

**Testing:**
```bash
pnpm dev --filter squareone
```
Use Playwright MCP to:
1. Navigate to http://localhost:3000/settings
2. Verify Account page loads with sidebar
3. Click on Access Tokens link and verify navigation
4. Click on Sessions link and verify navigation
5. Test mobile menu at narrow viewport
6. Verify active states update on navigation

**Commit message:**
```
Add initial settings pages with server-side rendering

Create Account, Access Tokens, and Sessions pages with proper
getServerSideProps implementation for appConfig loading. Pages
use SettingsLayout via getLayout pattern and include placeholder
content for future development.
```

---

## Prompt 4: Add Configuration Schema for Dynamic Navigation

**Task:**
Add settingsSessionsVisible boolean to the AppConfig schema to control Sessions page visibility dynamically.

**Files to modify:**
- `apps/squareone/squareone.config.schema.json`
- `apps/squareone/squareone.config.yaml`
- `apps/squareone/src/lib/config/AppConfig.ts`

**Implementation notes:**
- Add settingsSessionsVisible as optional boolean with default true
- Update TypeScript interface to include the new field
- Set it to true in the default config yaml
- Schema should have proper description

**Testing:**
```bash
pnpm type-check --filter squareone
pnpm build --filter squareone
```
Verify the config loads correctly by checking the dev server still works.

**Commit message:**
```
Add settingsSessionsVisible config option

Add configuration option to control visibility of Sessions page
in settings navigation. Defaults to true for backward
compatibility. Allows deployment-specific control over which
settings sections are available to users.
```

---

## Prompt 5: Implement Dynamic Navigation Filtering

**Task:**
Update SettingsLayout to dynamically filter navigation based on AppConfig. The Sessions section should only appear when settingsSessionsVisible is true.

**Files to modify:**
- `apps/squareone/src/components/SettingsLayout/SettingsLayout.tsx`
- `apps/squareone/src/components/SettingsLayout/settingsNavigation.ts`

**Implementation notes:**
- Use useAppConfig hook to access configuration
- Move navigation generation to a function that takes config
- Filter Sessions item based on settingsSessionsVisible
- Use useMemo to optimize navigation computation
- Maintain section structure (Security section with Sessions)

**Testing:**
1. Set settingsSessionsVisible to false in config yaml
2. Run dev server and verify Sessions is hidden
3. Set it back to true and verify Sessions appears
4. Check Storybook stories still work with mock configs

```bash
pnpm dev --filter squareone
```
Use Playwright MCP to verify navigation updates based on config.

**Commit message:**
```
Implement dynamic navigation based on AppConfig

Update SettingsLayout to filter navigation items based on
application configuration. Sessions page visibility now
controlled by settingsSessionsVisible config option. Navigation
is computed dynamically using useMemo for performance.
```

---

## Prompt 6: Add User Context to Settings Title

**Task:**
Integrate useGafaelfawrUser hook to display username in settings title when available.

**Files to modify:**
- `apps/squareone/src/components/SettingsLayout/SettingsLayout.tsx`

**Implementation notes:**
- Import and use useGafaelfawrUser hook
- Display "Settings" when username unavailable
- Display "{username} Settings" when username is available
- Handle loading state gracefully (no loading indicators)
- Use optional chaining for safe access

**Testing:**
```bash
pnpm dev --filter squareone
```
Test with mock user data if available in development mode. The title should update when user data loads.

**Commit message:**
```
Add username to settings sidebar title

Integrate useGafaelfawrUser hook to personalize settings title
with username when available. Gracefully falls back to generic
"Settings" title when user data is unavailable or loading.
```

---

## Prompt 7: Add Integration Tests for Dynamic Features

**Task:**
Create Storybook stories that demonstrate the dynamic features:
- Navigation filtering based on config
- Username display in title
- Different configuration scenarios

**Files to modify:**
- `apps/squareone/src/components/SettingsLayout/SettingsLayout.stories.tsx`

**Implementation notes:**
- Add story with settingsSessionsVisible: false
- Add story with mock user showing username in title
- Add story combining both dynamic features
- Use decorators to provide different configs

**Testing:**
```bash
pnpm storybook --filter squareone
pnpm test-storybook --filter squareone
```
Verify all stories render correctly and dynamic features work.

**Commit message:**
```
Add stories for SettingsLayout dynamic features

Create Storybook stories demonstrating dynamic navigation
filtering and username display. Stories cover various
configuration scenarios including hidden Sessions page and
personalized titles with user context.
```

---

## Prompt 8: Add Vitest Unit Tests

**Task:**
Create unit tests for the settingsNavigation function and dynamic filtering logic.

**Files to create:**
- `apps/squareone/src/components/SettingsLayout/settingsNavigation.test.ts`

**Implementation notes:**
- Test navigation generation with Sessions visible
- Test navigation generation with Sessions hidden
- Test that empty sections are removed
- Use vitest and follow existing test patterns

**Testing:**
```bash
pnpm test --filter squareone
```
All tests should pass.

**Commit message:**
```
Add unit tests for settings navigation logic

Create comprehensive unit tests for settingsNavigation function
covering dynamic filtering based on configuration. Tests verify
correct navigation structure for different config scenarios and
ensure empty sections are properly removed.
```

---

## Prompt 9: Final Integration Testing and Polish

**Task:**
Perform comprehensive testing of the entire settings section:
- Test all navigation paths work correctly
- Verify responsive behavior across breakpoints
- Check keyboard navigation and accessibility
- Ensure smooth page transitions
- Verify no console errors or warnings

**Testing steps:**
1. Start dev server: `pnpm dev --filter squareone`
2. Use Playwright MCP to:
   - Navigate through all settings pages
   - Test mobile menu open/close
   - Verify active states update correctly
   - Test keyboard navigation (Tab through items)
   - Check responsive behavior at various viewports
3. Run full test suite:
   ```bash
   pnpm lint --filter squareone
   pnpm type-check --filter squareone
   pnpm test --filter squareone
   pnpm build --filter squareone
   ```

**Files to modify (if issues found):**
- Fix any accessibility issues
- Address console warnings
- Polish animations or transitions

**Commit message (if changes needed):**
```
Polish settings navigation and fix minor issues

Address accessibility improvements and minor visual polish for
settings navigation. Ensure smooth transitions and proper
keyboard navigation support across all viewport sizes.
```

---

## Success Criteria

After completing all prompts, the following should be true:

1. SettingsLayout component works with dynamic navigation
2. Three settings pages are accessible and functional
3. Navigation filters based on AppConfig
4. Username displays in title when available
5. Mobile responsive behavior works correctly
6. All tests pass (lint, type-check, unit tests, build)
7. Storybook stories document all features
8. Keyboard navigation and accessibility are functional
9. No console errors or warnings in development
10. Smooth page transitions with persistent layout

## Notes for Implementation

- Each prompt should be completed and committed before moving to the next
- Use Playwright MCP for visual testing at each step
- If errors occur, fix them before committing
- Keep commits atomic and focused on single concerns
- Test progressively - don't wait until the end to test