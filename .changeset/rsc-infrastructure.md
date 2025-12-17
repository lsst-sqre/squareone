---
"squareone": minor
---

New React Server Components-compatible utilities for loading server-side configuration and MDX content

- **Config loading** (`src/lib/config/rsc/loader.ts`): Server-side configuration loading using React's `cache()` for request deduplication
- **MDX compilation** (`src/lib/mdx/rsc/compiler.ts`): RSC-compatible MDX content compilation for server components
- **ConfigProvider** (`src/contexts/rsc/ConfigProvider.tsx`): Context provider using React 19's `use()` hook to bridge server-loaded config to client components
- **useStaticConfig** hook (`src/hooks/useStaticConfig.ts`) provides seamless configuration access across both router patterns

These utilities enable the same configuration and content patterns used in Pages Router while leveraging RSC benefits like reduced client bundle size.
