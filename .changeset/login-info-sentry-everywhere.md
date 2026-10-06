---
'squareone': patch
---

Every part of the app that reads the signed-in user's Gafaelfawr login info (the header navigation, homepage hero, Apps menu, user menu, admin pages, notifications, and token and session settings pages) now reports login-info failures to Sentry. Previously only the user menu attached the Sentry reporter, but the login-info query is shared, so the fetches driven by the other components (including the initial fetch on most pages) could fail without a Sentry event. A new app-level `useLoginInfo` hook in `src/hooks/useLoginInfo` attaches the reporter and its `login-info` tags for every caller, and a Biome `noRestrictedImports` rule rejects importing `useLoginInfo` from `@lsst-sqre/gafaelfawr-client` directly in app code.
