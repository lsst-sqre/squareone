// This file configures client-side instrumentation for Next.js.
// Client-side Sentry initialization has been moved to _app.tsx
// to use AppConfig for runtime configuration instead of build-time environment variables.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
