// This file configures client-side instrumentation for Next.js.
// Since Sentry DSN is only available at runtime on the server (from Kubernetes
// ConfigMaps), we can't use NEXT_PUBLIC_ environment variables which are set
// at build time. Instead, _document.tsx loads the server configuration and
// injects it into the browser as window.__SENTRY_CONFIG__ for client-side use.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Get configuration injected by _document.tsx from server-side AppConfig
const config = typeof window !== 'undefined' ? window.__SENTRY_CONFIG__ : {};

Sentry.init({
  dsn: config.dsn || undefined,

  environment: config.environment || 'development',

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Trace requests through any other Sentry-enabled service in the same
  // environment. By default, only requests to 'localhost' and requests that
  // start with '/' have trace headers added. Many of our requests to external
  // services use the fully qualified URL.
  tracePropagationTargets: [config.baseUrl || ''],

  // Define how likely traces are sampled. Adjust this value in production, or
  // use tracesSampler for greater control.
  tracesSampleRate: config.tracesSampleRate || 0,

  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: config.replaysSessionSampleRate || 0,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: config.replaysOnErrorSampleRate || 1.0,

  // Setting this option to true will print useful information to the console
  // while you're setting up Sentry.
  debug: false,
});

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
