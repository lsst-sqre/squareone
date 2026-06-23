---
"squareone": patch
---

Bump js-yaml from 4.2.0 to 5.0.0. js-yaml 5 ships as a dual CJS/ESM package that exposes named exports only (the default export was removed) and bundles its own TypeScript types. The Sentry config-keys test now imports `{ load }` directly instead of the default export, and the hand-written `js-yaml` ambient type declaration plus the now-redundant `@types/js-yaml` dev dependency were dropped in favour of the bundled types. The server-side config loader already used `require('js-yaml').load`, which the CJS build continues to support unchanged.
