---
"squareone": minor
---

Add React Server Components infrastructure

New RSC-compatible utilities for the App Router migration:

- **Config loading** (`src/lib/config/rsc/loader.ts`): Server-side configuration loading using React's `cache()` for request deduplication
- **MDX compilation** (`src/lib/mdx/rsc/compiler.ts`): RSC-compatible MDX content compilation for server components
- **ConfigProvider** (`src/contexts/rsc/ConfigProvider.tsx`): Context provider using React 19's `use()` hook to bridge server-loaded config to client components

These utilities enable the same configuration and content patterns used in Pages Router while leveraging RSC benefits like reduced client bundle size.
