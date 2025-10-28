---
'@lsst-sqre/squared': minor
---

Add KeyValueList component for displaying key-value data

The KeyValueList component provides a reusable, accessible way to display key-value pairs using semantic HTML definition lists (`<dl>`, `<dt>`, `<dd>`). This component is designed for the quotas page but can be used throughout the application for displaying structured data.

Key features:

- **Semantic HTML**: Uses definition list elements for proper accessibility and screen reader support
- **Flexible values**: Supports both string and ReactNode values, allowing for badges, links, and formatted content
- **Responsive layout**: CSS Grid layout with two-column design on desktop, stacking vertically on mobile (≤768px)
