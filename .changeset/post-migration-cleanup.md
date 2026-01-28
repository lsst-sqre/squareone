---
"squareone": patch
---

Post-migration cleanup: remove SWR, migrate next/router references

- Removed `swr` dependency (fully replaced by TanStack Query)
- Migrated all `next/router` references to `next/navigation` in test setup, `TokenHistoryView` tests, and `NewTokenPage` Storybook story
- Updated Storybook story parameters from Pages Router `router`/`query` format to App Router `navigation`/`searchParams` format
- Updated `CLAUDE.md` and `.github/copilot-instructions.md` to reflect App Router-only architecture, RSC config patterns, and TanStack Query
