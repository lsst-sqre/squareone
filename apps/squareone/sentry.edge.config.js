// This file configures the initialization of Sentry for edge runtime.
// The config you add here will be used whenever the edge runtime handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.SQUAREONE_ENVIRONMENT_NAME || 'development',

  // Define how likely traces are sampled.
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
