---
'@lsst-sqre/squared': patch
---

Fix stacked-item alignment in `PrimaryNavigation`'s collapsed (hamburger) mode. Below the collapse breakpoint the open item list now stacks as a left-aligned column: it switches to `flex-direction: column` with `align-items: flex-start`, full width, an even vertical `gap`, and small vertical padding, and each item's horizontal row margin is reset to `0` (via a `.collapsible.open .item` rule whose specificity beats both squared's base `.item` margin and any consumer `.navItem` overrides). Previously items kept their horizontal row spacing in the vertical layout, so the first item sat flush-left while every other item was indented. Inline (above-breakpoint) layout is unchanged.
