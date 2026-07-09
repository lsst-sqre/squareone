---
'@lsst-sqre/squared': patch
---

Fix the dark-mode appearance of the squared `DateTimePicker` (and its `TimeInput`) by migrating their fixed `--rsd-color-gray-*` scale colors (identical in both themes) onto the adaptive `--rsd-component-*` semantic tokens that re-map under `data-theme="dark"` (DM-55433).

Most visibly, the calendar trigger, month-navigation buttons, weekday head cells, outside/adjacent days, and the time `:` separator previously rendered near-invisible fixed `--rsd-color-gray-400/500/600` on the dark background. They now use `--rsd-component-text-secondary-color` (muted but legible in both themes), matching the mapping convention this branch established across the notification modules, the shared `DataTable`/`KeyValueList`, and the form primitives.

The pass covers the whole calendar/time UI, migrating foreground and surface together so the popover reads correctly in dark:

- `DateTimePicker` — `.calendarButton`, `.calendarNavButton`, and `.calendarHeadCell` muted text plus `.calendarDayOutside` → `--rsd-component-text-secondary-color`; the `.calendarButton`/`.calendarNavButton` hover text → `--rsd-component-text-color`; the `.calendarButton`/`.calendarNavButton`/`.calendarDay`/`.monthSelect`/`.yearInput` hover and focus surfaces → `--rsd-component-surface-secondary-background-color`; and the `.calendarPopover`, `.monthSelect`, `.yearInput`, `.calendarNavButton`, and `.timeSection`/`.timezoneSection` borders/dividers → `--rsd-component-divider-color`. The now-redundant per-element `[data-theme="dark"]` border/surface overrides are dropped in favor of the adaptive tokens; the popover's deeper drop shadow and the month `<select>`'s lighter chevron glyph (an inline-SVG fill that can't reference a CSS variable) remain as genuine dark-only affordances.
- `TimeInput` — the spinbox `.timeSeparator` and button text → `--rsd-component-text-secondary-color`, its hover text → `--rsd-component-text-color`, the disabled/hover/active surfaces → `--rsd-component-surface-secondary-background-color`, and the spinbox container/button borders → `--rsd-component-divider-color`.

The Rubin brand-accent `--rsd-color-primary-*` selection/focus colors and the semantic `--rsd-color-red-600` error text are left as-is.

Removes `DateTimePicker.module.css` and `TimeInput.module.css` from the `validate-theme-tokens` baseline (`packages/repo-scripts/src/validate-theme-tokens.baseline.json`), since their flagged text colors are now genuinely adaptive; the guardrail stays green with the reduced baseline (16 known, all in the squareone app, remaining for a later batch). Adds a `Dark` Storybook story variant (pinning `globals: { theme: 'dark' }` via the existing `withThemeByDataAttribute` toolbar) that opens the calendar popover, so the head cells, day cells (selected and outside), hover states, and time inputs are visually verifiable in dark mode and can't silently rot.
