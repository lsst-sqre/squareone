# Phase 1: SidebarLayout Core Implementation Prompts

## Overview
This document contains atomic implementation prompts for creating the generic SidebarLayout component. Each prompt represents a single commit with tests included.

## Commit 1: Create SidebarLayout component structure

**Prompt:**
Create the initial SidebarLayout component structure with TypeScript types and basic layout container. The component should accept children, sidebarTitle, and navSections props. Create the component file structure including index.ts for exports, SidebarLayout.tsx for the main component, and SidebarLayout.stories.tsx with a basic story showing static navigation. Include interaction testing within Storybook stories that verify the component renders and accepts props correctly.

**Expected files:**
- `apps/squareone/src/components/SidebarLayout/index.ts`
- `apps/squareone/src/components/SidebarLayout/SidebarLayout.tsx`
- `apps/squareone/src/components/SidebarLayout/SidebarLayout.stories.tsx`

**Commit message:**
```
Add initial SidebarLayout component structure

Create the base SidebarLayout component with TypeScript types for
props including children, sidebarTitle, and navSections. Includes
basic Storybook story with interaction testing for initial rendering.
```

## Commit 2: Implement desktop CSS Grid layout

**Prompt:**
Implement the desktop layout for SidebarLayout using CSS Grid with styled-components. The layout should have an 18rem sidebar on the left, main content on the right with ContentMaxWidth - 18rem width, a 2rem gap between columns, and center the entire layout with a 60rem max-width. Import and use ContentMaxWidth from src/styles/sizes.ts. Add Storybook stories showing the desktop layout with different content lengths and a visual regression test.

**Expected changes:**
- Update `SidebarLayout.tsx` with styled-components
- Add desktop layout story to `SidebarLayout.stories.tsx`
- Add layout dimension interaction tests to stories

**Commit message:**
```
Add desktop CSS Grid layout to SidebarLayout

Implement desktop layout with 18rem sidebar, content area, and 2rem
gap using CSS Grid. Centers layout with 60rem max width constraint.
Includes stories demonstrating layout with various content sizes.
```

## Commit 3: Add mobile responsive layout

**Prompt:**
Add mobile responsive layout to SidebarLayout that activates below 60rem viewport width. Mobile layout should use flexbox with vertical stacking, apply screen padding using var(--size-screen-padding-min), and prepare structure for collapsible navigation (navigation hidden by default). Add a media query using ContentMaxWidth as the breakpoint. Include Storybook stories for mobile viewport and tests verifying responsive behavior.

**Expected changes:**
- Update `SidebarLayout.tsx` with mobile styles
- Add mobile viewport stories to `SidebarLayout.stories.tsx`
- Add responsive behavior interaction tests to stories

**Commit message:**
```
Add mobile responsive layout to SidebarLayout

Implement mobile layout with vertical stacking and proper padding
below 60rem viewport. Navigation area prepared for disclosure
pattern. Includes mobile viewport stories and responsive tests.
```

## Commit 4: Create Sidebar component with navigation

**Prompt:**
Create the Sidebar component that renders inside SidebarLayout. It should display the sidebar title as a heading, render navigation sections with optional labels, and show navigation items as a list. For now, use placeholder <a> tags for navigation items (Next.js Link will be added later). Style the sidebar with proper typography using design tokens. Add stories showing sidebar with single section, multiple sections, and sections with/without labels.

**Expected files:**
- `apps/squareone/src/components/SidebarLayout/Sidebar.tsx`

**Expected changes:**
- Update `SidebarLayout.tsx` to use Sidebar component
- Update `SidebarLayout.stories.tsx` with section examples

**Commit message:**
```
Create Sidebar component with navigation structure

Add Sidebar component that renders title and navigation sections
with optional labels. Uses semantic HTML structure with proper
heading hierarchy. Includes interaction tests and stories for various configs.
```

## Commit 5: Implement sticky sidebar positioning

**Prompt:**
Implement sticky positioning for the sidebar on desktop viewports. The sidebar should stick to the top of the viewport when scrolling, have a height of 100vh, and enable internal scrolling with overflow-y: auto when content exceeds viewport height. Add Storybook stories with long navigation lists and long main content to demonstrate independent scrolling. Include tests verifying sticky behavior and scroll overflow.

**Expected changes:**
- Update Sidebar styles in `Sidebar.tsx`
- Add scrolling stories to `SidebarLayout.stories.tsx`
- Add scroll behavior interaction tests to stories

**Commit message:**
```
Add sticky positioning to sidebar on desktop

Implement sticky sidebar with independent scrolling when content
exceeds viewport height. Desktop sidebar stays fixed while main
content scrolls. Includes stories showing scroll behavior.
```

## Commit 6: Create MobileMenuToggle component

**Prompt:**
Create the MobileMenuToggle component that renders a hamburger icon button using FontAwesome bars icon from @fortawesome/react-fontawesome and @fortawesome/free-solid-svg-icons. The button should only be visible on mobile viewports, accept isOpen state and onClick handler props, include proper ARIA attributes (aria-expanded, aria-label), and be styled consistently with existing buttons. Add stories showing open/closed states and unit tests for accessibility attributes.

**Expected files:**
- `apps/squareone/src/components/SidebarLayout/MobileMenuToggle.tsx`
- `apps/squareone/src/components/SidebarLayout/MobileMenuToggle.stories.tsx`

**Commit message:**
```
Add MobileMenuToggle component with hamburger icon

Create accessible hamburger menu button using FontAwesome icon.
Includes ARIA attributes and responsive visibility. Only shown
on mobile viewports. Includes a11y interaction tests and state stories.
```

## Commit 7: Implement mobile header with title and toggle

**Prompt:**
Implement the mobile header that contains the sidebar title on the left and hamburger menu button on the right. The header should be sticky at the top of mobile viewport, use flexbox with space-between alignment, have appropriate padding and background, and include proper z-index for layering. Integrate MobileMenuToggle into the mobile header. Add stories showing the mobile header in different states and tests for layout structure.

**Expected changes:**
- Update `SidebarLayout.tsx` with mobile header
- Add mobile header stories to `SidebarLayout.stories.tsx`
- Add mobile header layout interaction tests to stories

**Commit message:**
```
Add sticky mobile header with title and toggle

Implement mobile header with sidebar title and hamburger button
using flexbox layout. Header sticks to top of viewport on mobile.
Includes stories showing header states and layout tests.
```

## Commit 8: Add react-a11y-disclosure for mobile menu

**Prompt:**
Integrate react-a11y-disclosure to manage mobile menu show/hide behavior. The menu should push content down (not overlay), use slide down/up animation with max-height transition (0.3s ease), be hidden by default on mobile, and maintain accessibility with proper ARIA states. Update the Sidebar component to work with disclosure pattern. Add stories demonstrating menu open/close animation and tests for disclosure behavior.

**Expected changes:**
- Update `SidebarLayout.tsx` with useDisclosure hook
- Update `Sidebar.tsx` for disclosure compatibility
- Add disclosure stories with interaction tests

**Commit message:**
```
Integrate react-a11y-disclosure for mobile menu

Add accessible disclosure pattern for mobile navigation menu using
react-a11y-disclosure. Menu slides down/up with smooth animation.
Includes stories showing menu states and accessibility interaction tests.
```

## Commit 9: Add keyboard navigation support

**Prompt:**
Implement keyboard navigation support including: Tab order with navigation items first then main content, Escape key to close mobile menu, proper focus management when menu opens/closes, and ensure all navigation items are keyboard accessible. Add skip link to jump to main content for accessibility. Include keyboard navigation tests and stories demonstrating tab order and focus management.

**Expected changes:**
- Update `SidebarLayout.tsx` with keyboard handlers
- Add skip link implementation
- Add keyboard navigation interaction tests to stories

**Commit message:**
```
Add keyboard navigation and skip link support

Implement keyboard navigation with proper tab order and Escape key
handling for mobile menu. Add skip link for accessibility. Focus
management ensures proper flow. Includes keyboard interaction tests.
```

## Commit 10: Add visual states for navigation items

**Prompt:**
Implement visual states for navigation items including: hover state with muted primary background (var(--rsd-color-primary-100)) and 0.5rem border radius with 0.2s transition, active/current page state with bold font and 4px left border in primary color, and ensure states work on both desktop and mobile. Add currentPath prop support to highlight active item. Include stories showing all visual states and tests for style application.

**Expected changes:**
- Create `SidebarNavItem.tsx` component
- Update `Sidebar.tsx` to use SidebarNavItem
- Add visual state stories with interaction tests

**Commit message:**
```
Add hover and active states to navigation items

Implement visual feedback for navigation with hover backgrounds
and active page indicators. Active items show bold text and left
border. Includes stories demonstrating all visual states.
```

## Commit 11: Add section label styling

**Prompt:**
Implement styling for optional section labels in the navigation including: smaller font size (0.875rem), bold weight, muted neutral color (var(--rsd-color-gray-600)), and appropriate margins (1rem top, 0.5rem bottom). Create SidebarNavSection component to handle section rendering with optional labels. Add stories showing sections with and without labels and tests for conditional rendering.

**Expected files:**
- `apps/squareone/src/components/SidebarLayout/SidebarNavSection.tsx`
- `apps/squareone/src/components/SidebarLayout/SidebarNavSection.stories.tsx`

**Commit message:**
```
Add section labels with proper styling

Create SidebarNavSection component for navigation grouping with
optional labels. Labels use smaller, bold, muted text. Sections
without labels render items directly. Includes conditional interaction tests.
```

## Commit 12: Set up vitest unit testing framework

**Prompt:**
Set up vitest unit testing framework alongside existing Storybook interaction tests to provide traditional unit test coverage. Create vitest configuration, add unit test files for each component (.test.tsx), and implement tests covering component props, state management, edge cases, and error boundaries. This complements the existing Storybook interaction tests with focused unit testing for logic validation.

**Expected files:**
- `apps/squareone/src/components/SidebarLayout/SidebarLayout.test.tsx`
- `apps/squareone/src/components/SidebarLayout/Sidebar.test.tsx`
- `apps/squareone/src/components/SidebarLayout/MobileMenuToggle.test.tsx`
- `apps/squareone/src/components/SidebarLayout/SidebarNavItem.test.tsx`
- `apps/squareone/src/components/SidebarLayout/SidebarNavSection.test.tsx`

**Expected changes:**
- Add vitest configuration if needed
- Create unit tests for all components focusing on props, state, and logic
- Test edge cases and error conditions not covered in Storybook
- Add test utilities for common testing patterns

**Commit message:**
```
Add vitest unit testing framework for SidebarLayout

Set up comprehensive unit testing with vitest alongside Storybook
interaction tests. Unit tests focus on component logic, props
validation, and edge cases. Provides dual testing approach.
```

## Commit 13: Add comprehensive test coverage

**Prompt:**
Add comprehensive test coverage for the complete SidebarLayout system including: responsive breakpoint behavior, accessibility compliance (ARIA attributes, keyboard navigation), mobile menu state management, visual regression tests for all states, and integration tests for the full component. Ensure all components have > 80% test coverage combining both unit tests and interaction tests. Add any missing edge case tests.

**Expected changes:**
- Update all story files with comprehensive interaction tests
- Add integration stories covering full component workflows
- Enhance existing stories with accessibility and visual regression testing
- Complete unit test coverage for remaining edge cases

**Commit message:**
```
Add comprehensive test coverage for SidebarLayout

Complete dual test suite covering responsive behavior, accessibility,
state management, and visual regression. Combines unit tests and
Storybook interaction tests. Includes edge cases and integration tests.
```

## Phase 1 Completion Checklist

After all commits, verify:
- [ ] Desktop layout works with CSS Grid
- [ ] Mobile layout works with flexbox
- [ ] Responsive breakpoint at 60rem
- [ ] Sticky sidebar on desktop
- [ ] Mobile menu with disclosure pattern
- [ ] Keyboard navigation support
- [ ] Visual states for hover and active
- [ ] Section labels render conditionally
- [ ] Skip link for accessibility
- [ ] All components have Storybook stories
- [ ] All components have interaction tests in stories
- [ ] All components have unit tests with vitest
- [ ] Test coverage > 80% via dual testing approach (stories + unit tests)

## Notes for Implementation

### Pre-commit Quality Checks
For each commit, run the following commands in order:
1. **Lint**: `pnpm lint` - Fix any linting errors
2. **Type Check**: `pnpm type-check` - Resolve TypeScript errors
3. **Build**: `pnpm build` - Ensure the app builds successfully
4. **Storybook**: `pnpm storybook` - Start Storybook and verify stories render
5. **Visual Testing**: Use Playwright to open and verify stories in browser
6. **Story Tests**: `pnpm test-storybook` - Run Storybook tests with vitest

### Implementation Guidelines
- Each commit should be atomic and include tests
- Verify Storybook stories render correctly in browser
- Test responsive behavior in browser DevTools (especially 60rem breakpoint)
- Check accessibility with keyboard navigation and screen readers
- Ensure styled-components use design tokens where applicable
- All tests should pass before committing

### Testing Workflow
1. Write component code
2. Create Storybook stories with interaction testing
3. Run quality checks above
4. Test manually in browser
5. Commit only when all checks pass

### Testing Approach
This project uses a **dual testing approach** combining both Storybook interaction tests and traditional vitest unit tests:

**Storybook Interaction Testing:**
- **Story-based testing**: Tests are written as interactions within Storybook stories
- **Interaction testing**: Use `@storybook/test` utilities (userEvent, expect, within) for component behavior testing
- **Addon-vitest integration**: Stories are automatically picked up by vitest through the addon
- **Browser testing**: All tests run in real browser environment through Storybook
- **Documentation**: https://storybook.js.org/docs/writing-tests/interaction-testing

**Vitest Unit Testing:**
- **Logic-focused testing**: Traditional unit tests for component logic, props, and state management
- **Edge case coverage**: Test error conditions and boundary cases not easily covered in stories
- **Fast feedback**: Quick test runs for development workflow
- **Isolation**: Test components in isolation without browser environment overhead

### Test Writing Patterns

**Storybook Interaction Test Pattern:**
```tsx
import { userEvent, within, expect } from '@storybook/test';

export const Interactive: Story = {
  args: { ... },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  }
};
```

**Vitest Unit Test Pattern:**
```tsx
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import MyComponent from './MyComponent';

test('renders with correct props', () => {
  const mockOnClick = vi.fn();
  render(<MyComponent onClick={mockOnClick} />);
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
});
```