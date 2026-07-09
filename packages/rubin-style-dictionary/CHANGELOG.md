# @lsst-sqre/rubin-style-dictionary

## 0.8.0

### Minor Changes

- [#543](https://github.com/lsst-sqre/squareone/pull/543) [`0fdb6db`](https://github.com/lsst-sqre/squareone/commit/0fdb6db7db652fe4578026f6c1ce8cb44c29f819) Thanks [@jonathansick](https://github.com/jonathansick)! - Add three adaptive `--rsd-component-*` semantic theme tokens that re-map under dark mode (via `tokens.dark.css`), and repair three pre-existing dangling `--sqo-*` references.

  New tokens (authored as `themed: {light, dark}` YAML in `rubin-style-dictionary`, so they regenerate into both `tokens.css` and `tokens.dark.css`):

  - `--rsd-component-text-secondary-color` — muted/secondary text (light `gray-600`, dark `gray-300`).
  - `--rsd-component-divider-color` — borders and dividers (light `gray-200`, dark `gray-700`).
  - `--rsd-component-surface-secondary-background-color` — subtle surfaces such as hover/selected rows and the inline code chip (light `gray-100`, dark `gray-700`).

  Repoint the three dangling refs at the new secondary-text token so muted text renders adaptively in both themes instead of silently falling back to inherited body color: `--sqo-color-text-secondary` in `AdminRequired.module.css` and `AuthRequired.module.css`, and `--sqo-text-muted` in `app/error.tsx`. Dark-gray weights are the starting values; exact tuning is deferred to the dark-mode visual-QA step.

  Migrate the user-facing notification CSS modules (`UserNotifications/UserNotificationsTableView.module.css` and `UserNotifications/UserNotificationDetailView.module.css`) off fixed `--rsd-color-gray-*` scale tokens onto these adaptive tokens, so the `/notifications` list, expanded body, detail page, and empty/loading states are legible in dark mode.

  Migrate the admin notification CSS modules (`AdminNotifications/NotificationFilters.module.css`, `AdminNotifications/NotificationsTableView.module.css`, `NotificationDetailView/NotificationDetailView.module.css`, and `NotificationForm/NotificationForm.module.css`) off fixed `--rsd-color-gray-*` scale tokens (and remove the hardcoded hex fallbacks in `NotificationForm.module.css`) onto these adaptive tokens, so the `/admin/notifications` list, filter bar, detail page, and `/admin/notifications/new` compose form are legible in dark mode.

  Move the bespoke notification callouts onto the shared squared components so they self-theme in dark mode: the boxed error/not-found states in `NotificationDetailView` and `UserNotificationDetailView` now render via squared `Note` (`type="note"`); the inline load-failure states in both table views and the across-pages bulk-mark-read failure render via squared `ErrorMessage`; and the select-all-across-pages info banner renders via squared `Note` (`type="info"`). This removes the last fixed `--rsd-color-red-*`/`--rsd-color-blue-*` callout tokens (and their now-dead CSS) from the notification modules.

  Add a `validate-theme-tokens` guardrail (`packages/repo-scripts/src/validate-theme-tokens.js`, wired into the root `localci` script and CI) that fails when a fixed color-scale token (`color: var(--rsd-color-gray-*|red-*|…)`) or a hardcoded hex is used for text in the notification CSS modules, so the dark-mode migration can't silently rot. The Rubin brand-accent alias `--rsd-color-primary-*` and non-text `background-color` uses are intentionally not flagged; scope is limited to the notification modules.

  Add dark-mode Storybook story variants (a `Dark` story pinning `globals: { theme: 'dark' }` via the existing `withThemeByDataAttribute` toolbar) for the key notification components — the user and admin table views, both detail views, the compose form, and a new `NotificationFilters` story for the filter bar — so the migration is visually verifiable in both themes and can't silently rot.

## 0.7.0

### Minor Changes

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

## 0.6.0

### Minor Changes

- [#218](https://github.com/lsst-sqre/squareone/pull/218) [`0baaffd667f8d53aeb2963f36371415516b2c0ff`](https://github.com/lsst-sqre/squareone/commit/0baaffd667f8d53aeb2963f36371415516b2c0ff) Thanks [@jonathansick](https://github.com/jonathansick)! - Add complete color ramps (100-800) for semantic colors

  Implements full color ramps for all semantic colors to support the Badge component and future UI components:

  - **Blue**: Complete 100-800 ramp with HSL-based color calculations
  - **Green**: Complete 100-800 ramp with HSL-based color calculations
  - **Orange**: Complete 100-800 ramp with HSL-based color calculations
  - **Purple**: Complete 100-800 ramp with HSL-based color calculations
  - **Red**: Complete 100-800 ramp with HSL-based color calculations
  - **Yellow**: Complete 100-800 ramp with HSL-based color calculations

  Each color ramp includes:

  - Shade 100-200: Light tints for soft variant backgrounds
  - Shade 300-500: Medium shades and base colors
  - Shade 600: Dark shade optimized for solid backgrounds and text (WCAG AA compliant)
  - Shade 700-800: Darker shades for depth and contrast

  All color combinations have been tested and verified to meet WCAG AA contrast requirements (4.5:1 minimum) for:

  - Solid variant: 600 shade on white background
  - Soft variant: 600 shade text on 200 shade background
  - Outline variant: 600 shade on page background

  These tokens are ready for use in Badge component variants and other UI elements requiring semantic color theming.

## 0.5.1

### Patch Changes

- [#188](https://github.com/lsst-sqre/squareone/pull/188) [`7a41984e02439cd16a2786196330492197f5c465`](https://github.com/lsst-sqre/squareone/commit/7a41984e02439cd16a2786196330492197f5c465) Thanks [@jonathansick](https://github.com/jonathansick)! - Use the project orange accent for color-orange-500 (was accidentally red before).

## 0.5.0

### Minor Changes

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`1323de7a7e4deb3ada11ebbf650883c70221958f`](https://github.com/lsst-sqre/squareone/commit/1323de7a7e4deb3ada11ebbf650883c70221958f) Thanks [@jonathansick](https://github.com/jonathansick)! - Add triad logos (Rubin+NSF+DOE).

### Patch Changes

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`9b717643a038f3936f520c2f85dfaa2d7ad2b0d3`](https://github.com/lsst-sqre/squareone/commit/9b717643a038f3936f520c2f85dfaa2d7ad2b0d3) Thanks [@jonathansick](https://github.com/jonathansick)! - Update partner logo lineup.

## 0.4.2

### Patch Changes

- [#148](https://github.com/lsst-sqre/squareone/pull/148) [`0e4d392`](https://github.com/lsst-sqre/squareone/commit/0e4d392afafe8437f39af3018ecf47d4a76567a2) Thanks [@jonathansick](https://github.com/jonathansick)! - Tweaks to the release process:

  - Associate rubin-style-dictionary with the lsst-sqre/squareone monorepo in its package.json metadata.

## 0.4.1

### Patch Changes

- [#143](https://github.com/lsst-sqre/squareone/pull/143) [`13e6f4c`](https://github.com/lsst-sqre/squareone/commit/13e6f4c4415e913665dd8922c0e079dd0fefe7ba) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated lsst-sqre/squareone into a turbo-based monorepo. Rubin Style Dictionary is now a package inside the monorepo.

## 0.4.0 (2022-12-01)

Added "crop" variants of all full-size and intermediate-size Rubin imagotype assets. For example, `assets/rubin-imagotype/rubin-imagotype-color-on-white-crop.svg` is a cropped version of `assets/rubin-imagotype/rubin-imagotype-color-on-white.svg`. The original imagotypes included a default margin. These new "crop" variants are cropped right to the art, so that the imagotype can align with other content in CSS/HTML layouts.

## 0.3.0 (2021-05-06)

- Added image assets from the Rubin Visual Identity, including imagotypes (full scale, intermediate, and favicon), watermarks, and partner logos. The full and intermediate-scale imagotypes in this distribution are additionally cropped so that the clearance corresponds to the desired "N" spacing.

  These files can be imported from the NPM package as regular static assets. Additionally, these assets are distributed in JSON files as Base 64-encoded strings.

- Support for theming with next-themes.

- Initial design tokens from components originating in the Squareone application (https://github.com/lsst-sqre/rsp-squareone).

- Fixed `color.green.500` to be the correct color from the Visual Identity Manual (previously it was the same as `color.purple.500`).

- Development dependencies:

- Updated lodash to 4.17.21
- Updated style-dictionary to 3.0.0-rc.8

## 0.2.1 (2021-02-17)

This version features a revised organization of design tokens:

- Global design tokens are abstract values taken from the Rubin Visual Identity Manual, such as colors.
- Component design tokens tie the global tokens to semantically relevant components, such as the color of text in a button.
- Component design tokens can be themed.

## 0.1.0 (2021-01-27)

This initial release of rubin-style-dictionary demonstrates how design tokens from the Rubin Visual Identity Manual can be encoded with Style Dictionary and exported to formats ready to use in applications.
