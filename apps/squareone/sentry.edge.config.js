// This file configures the initialization of Sentry for edge runtime.
// Since we're not using edge runtime features, this is a minimal configuration
// to satisfy the Sentry SDK requirements.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Minimal configuration - only initialize if we actually need edge runtime
// For Next.js 12.x, we typically don't need this
Sentry.init({
  // Only initialize if DSN is available
  dsn: process.env.SENTRY_DSN || undefined,

  // Minimal configuration
  tracesSampleRate: 0,
  debug: false,

  // Disable features that might cause issues
  integrations: [],
});
