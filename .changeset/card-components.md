---
"@lsst-sqre/squared": minor
"squareone": minor
---

Add Card, CardGroup, and Note components to squared package

New components for documentation and content display:

- **Card**: A content card with shadow and hover border when wrapped in links. Uses CSS Modules with design tokens.
- **CardGroup**: A responsive CSS Grid container for Card components with configurable `minCardWidth` and `gap` props.
- **Note**: A callout/note container with floating badge. Supports four types with distinct colors: `note` (red), `warning` (orange), `tip` (green), and `info` (blue).

The squareone docs page now imports these components from squared instead of using local styled-components implementations. This is part of the ongoing styled-components to CSS Modules migration.
