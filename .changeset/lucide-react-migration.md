---
'@lsst-sqre/squared': minor
'squareone': patch
---

Migrate icons from FontAwesome and react-feather to lucide-react

**squared package:**

- Replaced `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/react-fontawesome`, and `react-feather` with `lucide-react` as the unified icon library
- Updated all components (IconPill, Button, ClipboardButton, DateTimePicker, Modal, Select) to use Lucide icon components
- Fixed IconPill icon vertical alignment by replacing `font-size: 0.9em` with `vertical-align: text-bottom` for proper SVG baseline alignment
- Updated component prop types from FontAwesome `[IconPrefix, IconName]` tuples to `LucideIcon` component references
- Updated Storybook stories and tests to use Lucide icons

**squareone app:**

- Migrated all components from FontAwesome and react-feather imports to lucide-react
- Removed FontAwesome library initialization (`styles/icons.ts`) and CSS import from root layout
- Removed `react-feather` type declarations
- Added a custom `GitHubIcon` SVG component for the GitHub logo (not available in lucide-react)
- Updated icon CSS from `font-size`/`margin-right` patterns to `width`/`height`/flexbox for proper SVG alignment
- Removed FontAwesome mock from test setup
