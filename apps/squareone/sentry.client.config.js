// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

Sentry.init({
  dsn: publicRuntimeConfig.sentryDsn,

  environment: publicRuntimeConfig.environmentName,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Trace requests through any other Sentry-enabled service in the same
  // environment. By default, only requests to 'localhost' and requests that
  // start with '/' have trace headers added. Many of our requests to external
  // services use the fully qualified URL.
  // https://docs.sentry.io/platforms/javascript/tracing/instrumentation/automatic-instrumentation/#tracepropagationtargets
  tracePropagationTargets: [publicRuntimeConfig.baseUrl],

  // Define how likely traces are sampled. Adjust this value in production, or
  // use tracesSampler for greater control.
  tracesSampleRate: publicRuntimeConfig.sentryTracesSampleRate,

  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: publicRuntimeConfig.sentryReplaysSessionSampleRate,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: publicRuntimeConfig.sentryReplaysOnErrorSampleRate,

  // Setting this option to true will print useful information to the console
  // while you're setting up Sentry.
  debug: false,
});
