---
'squareone': minor
---

Add the shared app plumbing the admin notifications UI builds on. A `useSemaphoreUrl` hook reads `semaphoreUrl` from config via `useStaticConfig` (mirroring `useRepertoireUrl`). A `RenderedMarkdown` client component (plus a `useRenderedMarkdown` hook / `renderMarkdownToHtml` helper) renders raw Markdown — including GFM — to HTML synchronously via the existing `remark`/`remark-gfm`/`remark-html` toolchain, for the table summary, detail body, and compose preview. Dev mock Semaphore admin endpoints back local development: `GET /semaphore/v1/admin/notifications` (filtered, cursor-paginated via the shared `mock-notifications` helper, with a `Link` header and `X-Total-Count`), `POST` (appends to an in-memory dev store), and `GET /semaphore/v1/admin/notifications/{id}`. The dev `semaphoreUrl` now points at the local mock route, and `admin:notifications` is included in the dev session scopes.
