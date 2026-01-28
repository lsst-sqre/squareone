---
"squareone": patch
---

Migrate mock API routes from Pages Router to App Router

Migrated all 12 development mock API routes from Pages Router (`pages/api/dev/`) to App Router Route Handlers (`src/app/api/dev/`):

- Authentication routes: `user-info`, `login`, `logout`
- Times Square pages routes: page list, page metadata, HTML content, HTML status, and SSE events
- Times Square GitHub routes: directory tree and slug-based page lookup
- Times Square GitHub PR routes: PR metadata and PR page preview

Key changes:
- Replaced `NextApiRequest`/`NextApiResponse` with Web API `Request`/`Response` and `NextResponse`
- Converted SSE streaming from Node.js `res.write()` to Web Streams API (`ReadableStream`)
- Dynamic route params now use `Promise`-based access (Next.js 15+ pattern)
- Deleted the `src/pages/api/dev/` directory entirely
