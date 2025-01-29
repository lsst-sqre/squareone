// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

Sentry.init({
  dsn: publicRuntimeConfig.sentryDsn,

  environment: publicRuntimeConfig.environmentName,

  // Define how likely traces are sampled.
  tracesSampleRate: publicRuntimeConfig.sentryTracesSampleRate,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
