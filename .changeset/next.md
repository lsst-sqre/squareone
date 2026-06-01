---
"squareone": minor
"@lsst-sqre/squared": minor
"@lsst-sqre/eslint-config": patch
---

Upgrade to Next.js 16 (from 15.5.12 to 16.2.7)

Next.js 16 makes Turbopack the default bundler for both `next dev` and `next build`, fully removes the synchronous Request API compatibility shim, and raises the minimum Node.js version to 20.9. No application code changes were required: dynamic route `params` were already accessed asynchronously, there is no `middleware`/AMP/PPR usage, the ESLint config is already flat-config based, and `@sentry/nextjs` transparently supports Turbopack builds. Node.js stays on 22.

Related dependency changes:

- `eslint-config-next` bumped to 16.2.7 (in both `squareone` and the shared `@lsst-sqre/eslint-config`).
- `@lsst-sqre/squared`'s `next` peer dependency now requires `16`.
