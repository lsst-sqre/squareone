---
"squareone": minor
---

Complete Pages Router removal

Migrated the remaining Pages Router pages to App Router and deleted the entire `src/pages/` directory:

- **terms page**: Migrated to `src/app/terms/page.tsx` as a server component
- **enrollment pages**: Migrated 4 enrollment status pages (`pending-approval`, `pending-confirmation`, `thanks-for-signing-up`, `thanks-for-verifying`) to `src/app/enrollment/` using RSC MDX compilation via `compileMdxForRsc()`
- **Deleted framework files**: `_app.tsx`, `_document.tsx`, `_error.tsx` (App Router uses `layout.tsx`, `error.tsx`)
- **Deleted dev-only pages**: `login.tsx`, `logout.tsx`, `sentry-example-page.tsx`, `api/sentry-example-api.ts`
- **Deleted legacy modules**: `AppConfigContext.tsx` (replaced by RSC `ConfigProvider`), `footerLoader.ts` (Pages Router MDX serialization), `loadConfigAndMdx()` helper

Simplified `useStaticConfig` to only support the App Router `ConfigProvider` path, removing the `AppConfigContext` fallback branch. The `AppConfigContextValue` type is now re-exported from `useStaticConfig` for backward compatibility.

squareone is now fully App Router — no Pages Router code remains.
