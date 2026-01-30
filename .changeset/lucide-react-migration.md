---
'@lsst-sqre/squared': minor
'squareone': patch
---

Migrate icons from FontAwesome and react-feather to lucide-react

- Replaced `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/react-fontawesome`, and `react-feather` with `lucide-react` as the unified icon library
- Updated all components (IconPill, Button, ClipboardButton, DateTimePicker, Modal, Select) to use Lucide icon components
- Fixed IconPill icon vertical alignment by replacing `font-size: 0.9em` with `vertical-align: text-bottom` for proper SVG baseline alignment
- Updated component prop types from FontAwesome `[IconPrefix, IconName]` tuples to `LucideIcon` component references
- Updated Storybook stories and tests to use Lucide icons
