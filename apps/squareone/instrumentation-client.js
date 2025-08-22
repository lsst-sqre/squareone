// This file configures client-side instrumentation for Next.js.
// Use public enviornment variables for this configuration since AppConfig
// isn't available in this instrumentation hook context.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment:
    process.env.NEXT_PUBLIC_SQUAREONE_ENVIRONMENT_NAME || 'development',

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Trace requests through any other Sentry-enabled service in the same
  // environment. By default, only requests to 'localhost' and requests that
  // start with '/' have trace headers added. Many of our requests to external
  // services use the fully qualified URL.
  tracePropagationTargets: [process.env.NEXT_PUBLIC_SQUAREONE_BASE_URL || ''],

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
