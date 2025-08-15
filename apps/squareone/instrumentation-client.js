// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

// Note: Client-side code cannot access process.env directly in the browser.
// These values need to be exposed via Next.js env configuration in next.config.js
// or passed through app configuration context. For now, using direct env access
// which works for server-side rendered components.
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT_NAME || 'development';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

Sentry.init({
  dsn: sentryDsn,

  environment: environment,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Trace requests through any other Sentry-enabled service in the same
  // environment. By default, only requests to 'localhost' and requests that
  // start with '/' have trace headers added. Many of our requests to external
  // services use the fully qualified URL.
  // https://docs.sentry.io/platforms/javascript/tracing/instrumentation/automatic-instrumentation/#tracepropagationtargets
  tracePropagationTargets: [baseUrl],

  // Define how likely traces are sampled. Adjust this value in production, or
  // use tracesSampler for greater control.
  tracesSampleRate: parseFloat(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0'
  ),

  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: parseFloat(
    process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0'
  ),

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: parseFloat(
    process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0'
  ),

  // Setting this option to true will print useful information to the console
  // while you're setting up Sentry.
  debug: false,
});

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
