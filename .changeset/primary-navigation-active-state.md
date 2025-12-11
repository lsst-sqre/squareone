---
"@lsst-sqre/squared": patch
---

Add active state styling to PrimaryNavigation.TriggerLink

Added CSS styles for the `[data-active]` attribute on `TriggerLink` components. When a navigation link is marked as active, it now displays with:

- Highlighted text color matching the hover state
- Underline decoration for visual distinction

This enables applications to visually indicate the current page in the primary navigation by passing `active={true}` to `TriggerLink`.
