---
'@lsst-sqre/squared': minor
---

Add a `DropdownMenu` component wrapping `@radix-ui/react-dropdown-menu`. It follows the existing Radix-wrapper conventions (CSS Modules with design tokens, `forwardRef`, compound `Object.assign` sub-components, `displayName`) and provides `DropdownMenu` plus `Trigger`, `Content`, `Item`, `Label`, and `Separator` sub-components. The default trigger renders a styled button with a chevron affordance and supports `asChild` for composing a custom trigger (for example the squared `Button`). It is suited to bulk-actions menus and supports both click and keyboard interaction.
