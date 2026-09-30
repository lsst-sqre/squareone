---
'squareone': patch
---

The production server no longer logs a `MaxListenersExceededWarning` for each request to the Sentry tunnel (`/monitoring`), which the browser sends on every page view. Next.js 16.3 registers more `close` listeners on responses that it rewrites to an external origin ([vercel/next.js#97757](https://github.com/vercel/next.js/issues/97757)); with Sentry's own listeners, a tunnel response reached Node's default limit of 10. Squareone now raises the limit to 20 for tunnel responses only, so the warning still fires on any other route. The listeners were always released when the response closed, so this removes noise rather than a leak. The workaround will be removed once Squareone runs a Next.js release with the upstream fix ([vercel/next.js#97818](https://github.com/vercel/next.js/pull/97818)).
