---
"@lsst-sqre/squared": minor
"squareone": patch
---

Upgrade to Storybook 10.0.6

- Migrated both squared and squareone Storybook configurations to Storybook 10.0.6
- Updated all Storybook addons and dependencies to v10
- Applied ESM migration with standardized `import.meta.resolve()` for addon resolution
- Added a11y testing configuration with 'todo' mode (shows violations without failing CI)
- Improved vitest integration with a11y addon annotations in squared package
