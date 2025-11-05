---
'@lsst-sqre/squared': patch
'squareone': patch
'@lsst-sqre/rubin-style-dictionary': minor
---

Improve dark mode accessibility and color system

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
