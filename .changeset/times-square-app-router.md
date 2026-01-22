---
"squareone": minor
---

Migrate Times Square pages to App Router

All Times Square pages now use Next.js App Router instead of Pages Router:

- `/times-square` - Home page with GitHub repository listing
- `/times-square/github/[...tsSlug]` - GitHub notebook viewer
- `/times-square/github-pr/[owner]/[repo]/[commit]` - PR preview landing page
- `/times-square/github-pr/[owner]/[repo]/[commit]/[...tsSlug]` - PR notebook viewer

Key implementation details:

- **TimesSquareUrlParametersProviderAppRouter** - New provider using App Router navigation APIs (`useParams`, `usePathname`, `useSearchParams`) instead of Pages Router's `useRouter`
- **Shared layout** - `layout.tsx` handles service availability checks (404 if Times Square not configured) and wraps all pages with `WideContentLayout`
- **Client components** - SSE updates handled via `TimesSquareHtmlEventsProvider` in client component wrappers
- **Backward compatibility** - Pages Router versions retained for reference during transition

This completes the Times Square App Router migration as part of the broader squareone modernization effort.
