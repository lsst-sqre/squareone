---
"squareone": patch
---

Add TypeScript interfaces for Sentry configuration type safety. Introduces a shared `SentryConfig` interface in the config loader and uses it in `_document.tsx` to replace `any` types, improving type safety and removing biome-ignore lint suppressions.
