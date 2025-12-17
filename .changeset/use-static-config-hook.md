---
"squareone": minor
---

Add useStaticConfig hook for unified configuration access

New `useStaticConfig` hook (`src/hooks/useStaticConfig.ts`) provides seamless configuration access across both router patterns:

- **App Router**: Uses ConfigProvider with React 19's `use()` to resolve the config promise
- **Pages Router**: Falls back to AppConfigProvider's synchronous pattern

This enables gradual migration from Pages Router to App Router without duplicating shared components or adding conditional router detection logic. Components using `useStaticConfig` work correctly in both contexts.
