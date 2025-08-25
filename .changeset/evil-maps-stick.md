---
'squareone': minor
---

Replaced next/config and getInitialProps with AppConfigContext that is loaded from getServerSideProps. Individual components can now access configuration from the useAppConfig hook.

- Moved the client-side Sentry configuration to `_app.tsx` so that it can use the AppConfigContext. Previously it was loaded directly in the `instrumentation-client.js` hook that didn't have access to the app configuration.
