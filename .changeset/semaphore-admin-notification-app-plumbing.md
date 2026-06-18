---
'squareone': minor
---

Add the shared app plumbing the admin notifications UI builds on. A `useSemaphoreUrl` hook resolves the Semaphore base URL via Repertoire service discovery (mirroring `BroadcastBannerStack` and the RSC layout). A `RenderedMarkdown` client component (plus a `useRenderedMarkdown` hook / `renderMarkdownToHtml` helper) renders raw Markdown — including GFM — to HTML synchronously via the existing `remark`/`remark-gfm`/`remark-html` toolchain, for the table summary, detail body, and compose preview. Dev mock Semaphore admin endpoints back local development: `GET /semaphore/v1/admin/notifications` (filtered, cursor-paginated via the shared `mock-notifications` helper, with a `Link` header and `X-Total-Count`), `POST` (appends to an in-memory dev store), and `GET /semaphore/v1/admin/notifications/{id}`. The dev Repertoire discovery mock advertises the local Semaphore mock origin, and `admin:notifications` is included in the dev session scopes.
