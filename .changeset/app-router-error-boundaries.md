---
"squareone": patch
---

Add App Router error boundaries

Added error handling for the App Router migration:

- `error.tsx`: Catches errors in route segments and displays a recovery UI
- `global-error.tsx`: Root-level error boundary for errors in the layout itself

Both integrate with the existing design system and provide user-friendly error recovery options.
