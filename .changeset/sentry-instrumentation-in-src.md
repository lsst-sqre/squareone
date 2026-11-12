---
'squareone': patch
---

Complete the migration to the Sentry SDK v11 file layout

The Next.js instrumentation hooks now live in `src/` next to the `app` directory (`src/instrumentation.ts` and `src/instrumentation-client.js`). This is the location that Next.js and the Sentry SDK expect when the app uses a `src` directory, and it removes the "Could not find an instrumentation file next to your src/app directory" warning that the server logged on every start.

React component name annotation is now configured through the top-level `reactComponentAnnotation` build option, replacing the deprecated `webpack.reactComponentAnnotation`. Since Squareone builds with Turbopack, this turns component annotation on for production builds for the first time: rendered elements carry `data-sentry-component` attributes, which give Sentry breadcrumbs and session replays readable component names.
