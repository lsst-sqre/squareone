# @lsst-sqre/squared

## 0.11.0

### Minor Changes

- [#269](https://github.com/lsst-sqre/squareone/pull/269) [`c2de825`](https://github.com/lsst-sqre/squareone/commit/c2de825b768357572e37f6c8396bde57fdc11430) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade to Storybook 10.0.6

  - Migrated both squared and squareone Storybook configurations to Storybook 10.0.6
  - Updated all Storybook addons and dependencies to v10
  - Applied ESM migration with standardized `import.meta.resolve()` for addon resolution
  - Added a11y testing configuration with 'todo' mode (shows violations without failing CI)
  - Improved vitest integration with a11y addon annotations in squared package

### Patch Changes

- [#291](https://github.com/lsst-sqre/squareone/pull/291) [`5027c65`](https://github.com/lsst-sqre/squareone/commit/5027c650d8e64ee73c98dc840d6aed18bd1f6e97) Thanks [@jonathansick](https://github.com/jonathansick)! - Bump playwright from 1.55.0 to 1.56.1

- [#250](https://github.com/lsst-sqre/squareone/pull/250) [`eff9f7a`](https://github.com/lsst-sqre/squareone/commit/eff9f7a9716cdf974372f74f338a81f86f98f75c) Thanks [@jonathansick](https://github.com/jonathansick)! - Align dependency versions across packages to prepare for Dependabot groups

  - Update eslint-config-next from 12.2.4 to 15.5.0 in eslint-config package
  - Standardize eslint to 8.46.0 across squared and squareone packages
  - Update swr from 2.2.1 to 2.3.6 in squared package
  - Update @fortawesome/react-fontawesome from 0.2.0 to 0.2.2 in squareone package

  These version alignments eliminate inconsistencies that could cause conflicts when Dependabot groups are enabled for coordinated dependency updates.

## 0.10.2

### Patch Changes

- [#244](https://github.com/lsst-sqre/squareone/pull/244) [`3e4a8fb612ac14d0f1ec214ed09be4a567b6b16a`](https://github.com/lsst-sqre/squareone/commit/3e4a8fb612ac14d0f1ec214ed09be4a567b6b16a) Thanks [@jonathansick](https://github.com/jonathansick)! - Improve Tabs component contrast in dark mode

  Enhanced the visibility of unselected tab labels in dark mode by implementing proper color overrides. Unselected tabs now use light gray text (`--rsd-component-text-reverse-color`) instead of dark gray, significantly improving readability on dark backgrounds. Selected tabs and hover states use lighter teal colors that maintain the visual hierarchy while providing better contrast.

## 0.10.1

### Patch Changes

- [#242](https://github.com/lsst-sqre/squareone/pull/242) [`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317) Thanks [@jonathansick](https://github.com/jonathansick)! - Improve dark mode accessibility and color system

  Enhanced dark mode support across components with improved text contrast for better accessibility:

  - Fixed button text visibility in dark theme (secondary buttons)
  - Fixed ClipboardButton success text contrast
  - Fixed DateTimePicker calendar hover states and year input backgrounds
  - Fixed TokenHistory hover text contrast
  - Improved token key text contrast in TokenDetailsView
  - Enhanced footer and general link contrast with blue-300 color
  - Adapted dropdown shadows for better dark mode visibility
  - Consolidated navigation menu viewport styling

  Added complete color ramps to design tokens:

  - Added missing primary color shades (primary-300, primary-400, primary-600, primary-700)
  - Added complete gray color scale (gray-100 through gray-900)
  - Added text-light token for improved light text on dark backgrounds

  These changes ensure WCAG AA compliance for text contrast in both light and dark themes.

- [#242](https://github.com/lsst-sqre/squareone/pull/242) [`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317) Thanks [@jonathansick](https://github.com/jonathansick)! - Add bottom padding to DateTimePicker time section

  Improved visual spacing in the DateTimePicker component by adding bottom padding to the time selection section, preventing the UI from feeling cramped at the bottom of the picker.

- [#242](https://github.com/lsst-sqre/squareone/pull/242) [`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317) Thanks [@jonathansick](https://github.com/jonathansick)! - Add dark theme support to Storybook

  Added dark theme background support to both squareone and squared Storybook configurations, enabling proper testing and development of components in dark mode. This includes setting up the appropriate CSS custom properties for dark theme backgrounds in Storybook preview environments.

- Updated dependencies [[`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317)]:
  - @lsst-sqre/rubin-style-dictionary@0.7.0
  - @lsst-sqre/global-css@0.2.4

## 0.10.0

### Minor Changes

- [#240](https://github.com/lsst-sqre/squareone/pull/240) [`1d8161aa169c159762e28b0e3c1afaea5514ef15`](https://github.com/lsst-sqre/squareone/commit/1d8161aa169c159762e28b0e3c1afaea5514ef15) Thanks [@jonathansick](https://github.com/jonathansick)! - Add TAP quota types and improve nullable handling in useGafaelfawrUser

  The `useGafaelfawrUser` hook now includes complete type definitions for all Gafaelfawr quota types, supporting the new quotas page feature:

  **New types added:**

  - `GafaelfawrTapQuota`: Represents TAP service concurrent query limits with a `concurrent` field
  - All quota-related types are now exported: `GafaelfawrQuota`, `GafaelfawrNotebookQuota`, `GafaelfawrApiQuota`, `GafaelfawrTapQuota`, `GafaelfawrGroup`

  **Type improvements:**

  - `GafaelfawrNotebookQuota`: Added `spawn: boolean` field to indicate if notebook spawning is allowed
  - `GafaelfawrQuota`: Added `tap` field for TAP service quotas; made `notebook` explicitly nullable (`| null`)
  - `GafaelfawrUser`: Made `quota` field explicitly nullable (`| null`) to properly handle API responses

  These changes align with the Gafaelfawr API specification and enable proper handling of quota data in the quotas page, including null/empty states for optional quota sections.

- [#240](https://github.com/lsst-sqre/squareone/pull/240) [`0e49cf80e8be37ffca6e7897ba07aa91881e7be3`](https://github.com/lsst-sqre/squareone/commit/0e49cf80e8be37ffca6e7897ba07aa91881e7be3) Thanks [@jonathansick](https://github.com/jonathansick)! - Add KeyValueList component for displaying key-value data

  The KeyValueList component provides a reusable, accessible way to display key-value pairs using semantic HTML definition lists (`<dl>`, `<dt>`, `<dd>`). This component is designed for the quotas page but can be used throughout the application for displaying structured data.

  Key features:

  - **Semantic HTML**: Uses definition list elements for proper accessibility and screen reader support
  - **Flexible values**: Supports both string and ReactNode values, allowing for badges, links, and formatted content
  - **Responsive layout**: CSS Grid layout with two-column design on desktop, stacking vertically on mobile (≤768px)

- [#228](https://github.com/lsst-sqre/squareone/pull/228) [`bf0a8e50a321874abe551ad148255b7546680f31`](https://github.com/lsst-sqre/squareone/commit/bf0a8e50a321874abe551ad148255b7546680f31) Thanks [@jonathansick](https://github.com/jonathansick)! - Add Tabs component for tabbed navigation interfaces

  The Tabs component built on Radix UI primitives, providing a fully accessible tabbed interface for organizing content into multiple panels. Key Features:

  - Compound component API (`Tabs.List`, `Tabs.Trigger`, `Tabs.Content`) for flexible composition
  - Full keyboard navigation support (Arrow keys, Home, End)
  - WCAG AAA compliant touch targets (44px minimum)
  - Controlled and uncontrolled modes for state management
  - CSS Modules styling with design tokens from rubin-style-dictionary
  - Comprehensive Storybook documentation with 11 interactive stories and automated tests

## 0.9.0

### Minor Changes

- [#210](https://github.com/lsst-sqre/squareone/pull/210) [`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb) Thanks [@jonathansick](https://github.com/jonathansick)! - Replace tsup build with direct TypeScript transpilation

  Replaced the tsup build tool with direct TypeScript transpilation through the consuming applications. This change:

  - Exports TypeScript source files directly from the package
  - Lets Next.js and other consuming apps handle transpilation
  - Simplifies the build pipeline and removes the build step from the squared package
  - Improves development experience with faster HMR

- [#210](https://github.com/lsst-sqre/squareone/pull/210) [`9b6312854eee408a687b8c77978833032773934e`](https://github.com/lsst-sqre/squareone/commit/9b6312854eee408a687b8c77978833032773934e) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a new Button component

  This button has flexible styling and utility for a range of applications. It has two main axes of styling via props:

  - `appearance` can be `solid|outline|text`
  - `tone` is `primary|secondary|tertiary|danger` and controls the semantics of the button
  - `role` is a way of quickly setting appearance and tone together for common uses. `role=primary` creates a solid button with primary tone.

  The button also supports icons, loading state, and can be implemented both as a button element or as a link.

- [#213](https://github.com/lsst-sqre/squareone/pull/213) [`024b11f8653bb1ade38240f890d8fbbb02aa0841`](https://github.com/lsst-sqre/squareone/commit/024b11f8653bb1ade38240f890d8fbbb02aa0841) Thanks [@jonathansick](https://github.com/jonathansick)! - Add Checkbox and CheckboxGroup components with comprehensive accessibility features

  Introduces new form input components that extend the squared design system:

  - **Checkbox**: Accessible checkbox input with multiple size variants (sm, md, lg), disabled states, and error handling. Features WCAG 2.5.5 compliant touch targets with visual appearance that scales independently of the minimum touch area.

  - **CheckboxGroup**: Fieldset-based container for multiple checkboxes with proper legend semantics, orientation options (horizontal/vertical), and FormField integration. Uses the polymorphic Label component for consistent legend styling with support for required indicators and descriptions.

  Both components integrate seamlessly with React Hook Form and provide comprehensive Storybook stories for documentation and testing. The implementation follows the established patterns from RadioGroup and other form components in the library.

- [#216](https://github.com/lsst-sqre/squareone/pull/216) [`7238f2ede9e3c1838311bea84d2c3c065be2ad13`](https://github.com/lsst-sqre/squareone/commit/7238f2ede9e3c1838311bea84d2c3c065be2ad13) Thanks [@jonathansick](https://github.com/jonathansick)! - Add ClipboardButton component with success feedback

  New ClipboardButton component provides:

  - One-click copying of text to clipboard
  - Visual success feedback with configurable duration
  - Support for static text or dynamic text via function callback
  - Customizable labels for default and success states
  - Optional icon display
  - Forward ref support for focus management
  - Built on squared Button component with consistent styling

  Includes clipboard utility functions with fallback support for older browsers.

- [#210](https://github.com/lsst-sqre/squareone/pull/210) [`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate components from styled-components to CSS Modules

  Migrated the IconPill and PrimaryNavigation components from styled-components to CSS Modules for better performance and smaller bundle size. This change:

  - Removes the styled-components dependency from the squared package
  - Improves build-time CSS processing
  - Maintains all existing styling and functionality
  - Adds CSS Module type definitions for TypeScript support

- [#219](https://github.com/lsst-sqre/squareone/pull/219) [`c85b08254b7bc14688b9f889541962a0a0d511b4`](https://github.com/lsst-sqre/squareone/commit/c85b08254b7bc14688b9f889541962a0a0d511b4) Thanks [@jonathansick](https://github.com/jonathansick)! - Add DateTimePicker component with string-based API

  A new comprehensive DateTimePicker component has been added to the squared package, providing:

  **Core Features:**

  - Date and time selection with ISO 8601 datetime-local format
  - Timezone support with conversion between timezones (including 'local' timezone)
  - Calendar picker with custom caption (month/year navigation)
  - Time input with hours/minutes in 24-hour format
  - Timezone selector integrated with the date/time picker
  - Full keyboard accessibility and ARIA support
  - CSS Modules styling with design tokens
  - Comprehensive test coverage (unit and Storybook tests)
  - Built on react-day-picker for calendar functionality
  - Fixed popover auto-closing issue when clicking inside the picker for better UX in filter contexts

  **API Design:**

  - **String-based API**: Uses ISO 8601 strings for dates (`defaultValue` prop)
  - **Uncontrolled pattern**: Component manages its own state internally
  - **Simple onChange signature**: `(isoString: string) => void` - returns ISO 8601 timestamp only
  - **Explicit timezone control**: `defaultTimezone` prop for initial timezone (default: 'local')
  - **Optional seconds support**: `showSeconds` prop for precise timestamps
  - **Force updates**: Use `key` prop to reset component with new values

  **Exports:**

  - `DateTimePicker` component
  - Utility functions for date/time manipulation (`dateUtils.ts`)
  - Timezone handling utilities (`timezoneUtils.ts`)

  **Usage Example:**

  ```tsx
  <DateTimePicker
    defaultValue="2024-01-15T14:30:00Z"
    defaultTimezone="UTC"
    onChange={(isoString) => console.log(isoString)}
  />
  ```

  The string-based API provides better interoperability with REST APIs and simplifies common usage patterns by eliminating the need for Date object conversion.

- [#211](https://github.com/lsst-sqre/squareone/pull/211) [`4bdb71382f3c5a935a9309bd5e5cc32c8e2210e5`](https://github.com/lsst-sqre/squareone/commit/4bdb71382f3c5a935a9309bd5e5cc32c8e2210e5) Thanks [@jonathansick](https://github.com/jonathansick)! - Add comprehensive form input component library

  Introduces a complete set of foundational form components to the squared design system:

  - **Label**: Polymorphic label component supporting both `<label>` and `<legend>` elements with `as` prop for semantic flexibility. Features include required indicator support, optional description text, multiple sizing variants (sm, md, lg), and consistent styling across form labels and fieldset legends. Full TypeScript support with proper type inference for element types.
  - **ErrorMessage**: Consistent error messaging component with accessibility features
  - **TextInput**: Full-featured text input with validation states, sizing variants, and accessibility
  - **FormField**: Compound component that provides context and orchestrates label, input, and error message relationships

- [#205](https://github.com/lsst-sqre/squareone/pull/205) [`362b05ea70a859f982c01fd129328d126816dfba`](https://github.com/lsst-sqre/squareone/commit/362b05ea70a859f982c01fd129328d126816dfba) Thanks [@jonathansick](https://github.com/jonathansick)! - Adopted @storybook/addon-vitest for improved testing performance and browser-based testing

  - Run `pnpm test-storybook` to execute Storybook tests using Vitest

- [#216](https://github.com/lsst-sqre/squareone/pull/216) [`7238f2ede9e3c1838311bea84d2c3c065be2ad13`](https://github.com/lsst-sqre/squareone/commit/7238f2ede9e3c1838311bea84d2c3c065be2ad13) Thanks [@jonathansick](https://github.com/jonathansick)! - Add Modal component with accessibility support

  New Modal component provides:

  - Dialog overlay with backdrop click handling (configurable)
  - Close button with customizable label
  - Accessible ARIA labeling with title and optional description
  - Focus management for keyboard navigation
  - CSS Modules styling with design tokens
  - Comprehensive Storybook documentation and tests

  The Modal component follows accessibility best practices and integrates seamlessly with the squared design system.

- [#212](https://github.com/lsst-sqre/squareone/pull/212) [`514c4e752c0e6f3c35b58781d6584edd22de366a`](https://github.com/lsst-sqre/squareone/commit/514c4e752c0e6f3c35b58781d6584edd22de366a) Thanks [@jonathansick](https://github.com/jonathansick)! - Add RadioGroup component with comprehensive accessibility features

  Introduces a new RadioGroup component built with Radix UI primitives:

  - **Fieldset-based structure** with proper legend and description support
  - **Multiple sizing variants** (sm, md, lg) for different use cases
  - **Flexible layout options** with horizontal and vertical orientations
  - **Individual item descriptions** for additional context
  - **Full accessibility compliance** with ARIA attributes and keyboard navigation
  - **Form integration** works seamlessly with FormField and React Hook Form
  - **Disabled state support** for individual options
  - **Required field indicators** with proper semantic markup
  - **Compound component pattern** (RadioGroup.Item) for clean API

  The component supports both controlled and uncontrolled usage patterns, making it suitable for various form implementation approaches across the design system.

- [#214](https://github.com/lsst-sqre/squareone/pull/214) [`5de611d8d5a4ebf5677241982d6932e5e2aa77d1`](https://github.com/lsst-sqre/squareone/commit/5de611d8d5a4ebf5677241982d6932e5e2aa77d1) Thanks [@jonathansick](https://github.com/jonathansick)! - Add Select component with comprehensive accessibility and functionality

  Introduces a new Select component built with Radix UI primitives that provides:

  - **Multiple sizing variants** (sm, md, lg) for different UI contexts
  - **Full accessibility compliance** with ARIA attributes, keyboard navigation, and custom aria-label support
  - **Compound component pattern** (Select.Item, Select.Group, Select.Separator) for flexible composition
  - **Controlled and uncontrolled modes** supporting both React Hook Form and standalone usage
  - **Group and separator support** for organizing complex option lists
  - **Scrollable dropdown support** with visual scroll indicators for long option lists
  - **Full-width layout option** for responsive form layouts
  - **Form integration** works seamlessly with FormField and other form components
  - **Disabled state support** for individual options
  - **Portal-based rendering** to avoid z-index issues
  - **Custom accessible labels** via optional aria-label prop for enhanced accessibility context

- [#205](https://github.com/lsst-sqre/squareone/pull/205) [`3396e84b11d375679f9e93e12367e9b32c865cfd`](https://github.com/lsst-sqre/squareone/commit/3396e84b11d375679f9e93e12367e9b32c865cfd) Thanks [@jonathansick](https://github.com/jonathansick)! - Drop GafaelfawrUserDropdown and GafaelfawrUserMenu components (replaced by PrimaryNavigation)

- [#205](https://github.com/lsst-sqre/squareone/pull/205) [`a9e269c52e9259afd8657ca0c784b1aa966f0b27`](https://github.com/lsst-sqre/squareone/commit/a9e269c52e9259afd8657ca0c784b1aa966f0b27) Thanks [@jonathansick](https://github.com/jonathansick)! - Deleted the "Button" example component

- [#210](https://github.com/lsst-sqre/squareone/pull/210) [`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb) Thanks [@jonathansick](https://github.com/jonathansick)! - Add comprehensive testing setup for squared components

  Added a complete testing infrastructure for the squared component library:

  - Configured vitest for unit testing with React Testing Library
  - Set up Storybook addon-vitest for testing stories
  - Added test setup file for common test utilities
  - Created comprehensive tests for the new Button component
  - Configured testing commands for both unit tests and Storybook tests

- [#215](https://github.com/lsst-sqre/squareone/pull/215) [`e28bd8c294249c99d12af40d36fc8bd93cc9b9e4`](https://github.com/lsst-sqre/squareone/commit/e28bd8c294249c99d12af40d36fc8bd93cc9b9e4) Thanks [@jonathansick](https://github.com/jonathansick)! - Add TextArea component with auto-resize and accessibility features

  Introduces a new TextArea component to complement the existing form input library:

  - **Multiple sizing variants** (sm, md, lg) for different UI contexts
  - **Visual state indicators** (default, error, success) for form validation feedback
  - **Auto-resize functionality** with configurable min/max rows for dynamic content
  - **Full accessibility compliance** with proper ARIA attributes and semantic markup
  - **FormField integration** works seamlessly with the form system for labels and error messages
  - **Full-width layout option** for responsive form layouts
  - **Flexible row configuration** with sensible defaults for different use cases

  The component supports both controlled and uncontrolled usage patterns and integrates with React Hook Form validation. Auto-resize feature intelligently calculates height based on content while respecting min/max constraints.

- [#219](https://github.com/lsst-sqre/squareone/pull/219) [`c85b08254b7bc14688b9f889541962a0a0d511b4`](https://github.com/lsst-sqre/squareone/commit/c85b08254b7bc14688b9f889541962a0a0d511b4) Thanks [@jonathansick](https://github.com/jonathansick)! - Add trailingAction prop to TextInput component

  The TextInput component now supports a `trailingAction` prop for adding interactive elements (like buttons) at the end of the input field. This is distinct from `trailingIcon` which is for non-interactive visual elements.

  - `trailingAction` and `trailingIcon` are mutually exclusive
  - When `trailingAction` is provided, it takes precedence
  - Proper styling and spacing for action elements
  - Used by DateTimePicker for calendar toggle button

### Patch Changes

- Updated dependencies [[`0baaffd667f8d53aeb2963f36371415516b2c0ff`](https://github.com/lsst-sqre/squareone/commit/0baaffd667f8d53aeb2963f36371415516b2c0ff)]:
  - @lsst-sqre/rubin-style-dictionary@0.6.0
  - @lsst-sqre/global-css@0.2.3

## 0.8.0

### Minor Changes

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade MSW (Mock Service Worker) to version 2.10.5

  This is a major version upgrade from MSW 1.x to 2.x, which includes:

  - Breaking changes in API and configuration
  - Updated request/response handling
  - New testing utilities and Storybook integration
  - Improved TypeScript support

  This upgrade affects mocking capabilities in Storybook stories and may require updates to mock configurations.

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

## 0.7.0

### Minor Changes

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`2b7c98f0bd660714e7f0c50635277664723f4fd5`](https://github.com/lsst-sqre/squareone/commit/2b7c98f0bd660714e7f0c50635277664723f4fd5) Thanks [@jonathansick](https://github.com/jonathansick)! - Fixed PrimaryNavigation DOM structure for Next.js 13+ compatibility and improved accessibility.

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`2b7c98f0bd660714e7f0c50635277664723f4fd5`](https://github.com/lsst-sqre/squareone/commit/2b7c98f0bd660714e7f0c50635277664723f4fd5) Thanks [@jonathansick](https://github.com/jonathansick)! - Changed typing style to use `type` rather than `interface` for consistency.

## 0.6.0

### Minor Changes

- [`b41e337e5517caa3332ad78d5ee62fc96d1f13fc`](https://github.com/lsst-sqre/squareone/commit/b41e337e5517caa3332ad78d5ee62fc96d1f13fc) Thanks [@jonathansick](https://github.com/jonathansick)! - Update to Next 13.5

- [`4129cd39404ff5d14cd3716fbd526839f851b50e`](https://github.com/lsst-sqre/squareone/commit/4129cd39404ff5d14cd3716fbd526839f851b50e) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate components to use transitive props for styled-components.

## 0.5.0

### Minor Changes

- [#192](https://github.com/lsst-sqre/squareone/pull/192) [`50d8d1f6cfef0318cb6c2767ba4feda8e120e348`](https://github.com/lsst-sqre/squareone/commit/50d8d1f6cfef0318cb6c2767ba4feda8e120e348) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate to React 18.3.1

  - Updated React from 17.0.2 to 18.3.1 across all packages
  - Updated React DOM to 18.3.1 for improved hydration and performance
  - Updated TypeScript types for React 18 compatibility
  - Updated styled-components to v5.3.11 for React 18 support
  - Updated Storybook React dependencies for compatibility

## 0.4.2

### Patch Changes

- Updated dependencies [[`7a41984e02439cd16a2786196330492197f5c465`](https://github.com/lsst-sqre/squareone/commit/7a41984e02439cd16a2786196330492197f5c465)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.1
  - @lsst-sqre/global-css@0.2.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`9b717643a038f3936f520c2f85dfaa2d7ad2b0d3`](https://github.com/lsst-sqre/squareone/commit/9b717643a038f3936f520c2f85dfaa2d7ad2b0d3), [`1323de7a7e4deb3ada11ebbf650883c70221958f`](https://github.com/lsst-sqre/squareone/commit/1323de7a7e4deb3ada11ebbf650883c70221958f)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.0
  - @lsst-sqre/global-css@0.2.1

## 0.4.0

### Minor Changes

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`b4b2fdb`](https://github.com/lsst-sqre/squareone/commit/b4b2fdb72ea42adf3142ee53bdb463e9bfebe441) Thanks [@jonathansick](https://github.com/jonathansick)! - Moved auth URLs into Squared as a library. The `getLoginUrl` and `getLogout` URL functions compute the full URLs to the RSP's login and logout endpoints and include the `?rd` query strings to return the user to current and home URL respectively.

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`77274e7`](https://github.com/lsst-sqre/squareone/commit/77274e7a144158ac267f4b38a1e7dc48cb10f2de) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a new PrimaryNavigation component. This component uses the Radix [NavigationMenu](https://www.radix-ui.com/primitives/docs/components/navigation-menu) primitive and is intended to be a comprehensive solution for the primary navigation in the header of Squareone. The earlier `GafaelfawrUserMenu` component in Squared also uses `NavigationMenu`, but as a single item. With `PrimaryNavigation`, the functionality of `GafaelfawrUserMenu` can be composed into an instance of `PrimaryNavigation`. Like `GafaelfawrMenu`, `PrimaryNavigation` is set up so that menus only appear after clicking on a trigger, rather than on hover. As well, `PrimaryNavigation` ensures the menu is proximate to the trigger (an improvement on the default `NavigationMenu` functionality that centers the menu below the whole navigation element.

## 0.3.0

### Minor Changes

- [#173](https://github.com/lsst-sqre/squareone/pull/173) [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd) Thanks [@jonathansick](https://github.com/jonathansick)! - Added a new component, `IconPill`. This component creates an inline pill that acts as a link button. The contents of the pill are an easy-to-configure icon from FontAwesome alongside text. The colours of the pill are configurable by props, but by default the pill looks similar to to the button component.

### Patch Changes

- Updated dependencies [[`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd)]:
  - @lsst-sqre/global-css@0.2.0

## 0.2.0

### Minor Changes

- [#166](https://github.com/lsst-sqre/squareone/pull/166) [`157d03d`](https://github.com/lsst-sqre/squareone/commit/157d03db4fe3e559dc0071c1a1567200d376e1be) Thanks [@jonathansick](https://github.com/jonathansick)! - Created GafaelfawrUserMenu based on the Radix UI [navigation-menu](https://www.radix-ui.com/primitives/docs/components/navigation-menu) component. That's the right primitive for an accessible menu that uses `<a>` or Next `Link` elements. The existing Gafaelfawr menu is now `GafaelfawrUserDropdown` for reference (it is based on Radix UI's [dropdown menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu), but is more appropriate as a menu of buttons.

- [#168](https://github.com/lsst-sqre/squareone/pull/168) [`f403ffd`](https://github.com/lsst-sqre/squareone/commit/f403ffd461983a579614d1ae4aa2c4b42537c294) Thanks [@jonathansick](https://github.com/jonathansick)! - Disable opening and closing the GafaelfawrUserMenu on hover. This is a better UX because it allows for less precise mousing when using the menu.

## 0.1.0

### Minor Changes

- [#155](https://github.com/lsst-sqre/squareone/pull/155) [`b765732`](https://github.com/lsst-sqre/squareone/commit/b765732db52e354026294fce7b5ef7c32d32e553) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a useGafaelfawrUser hook.

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`9abbebb`](https://github.com/lsst-sqre/squareone/commit/9abbebba02fc1bc27fe2097fbbdb97110a9c93d9) Thanks [@jonathansick](https://github.com/jonathansick)! - This is the first release of the Squared React component library for Squareone.

- [#155](https://github.com/lsst-sqre/squareone/pull/155) [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a GafaelfawrUserMenu component to squared. This is based on the Radix UI dropdown menu and implements a login button if the user is not authenticated or a full user settings menu if the user is authenticated. A logout menu item is always included at the end of the menu, but apps can compose other user menu items in the component. As the name implies, this component is tied into the logic and usage patterns of Gafaelfawr as an auth service.

- [#155](https://github.com/lsst-sqre/squareone/pull/155) [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a useCurrentUrl hook. This works with `react/router` and a provided base URL to get the absolute URL of the current page view. Next.js is now a peer dependency of squared to support this.

### Patch Changes

- Updated dependencies [[`5ee421b`](https://github.com/lsst-sqre/squareone/commit/5ee421bdd8f1c6f922913028ad48284f941189f1)]:
  - @lsst-sqre/global-css@0.1.0
