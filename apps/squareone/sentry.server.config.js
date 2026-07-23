// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { pinoLogsIntegrationOptions } from './src/lib/sentry/pinoLogsConfig';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Git commit SHA baked into the image at build time (see Dockerfile). Unset
  // in local dev, where events carry a null release.
  release: process.env.SENTRY_RELEASE,

  environment: process.env.SQUAREONE_ENVIRONMENT_NAME || 'development',

  // Define how likely traces are sampled.
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),

  // Enable Sentry Structured Logs so the pino bridge below can ship server-side
  // pino records to Sentry Logs (searchable, trace-linked). This does not by
  // itself create issues or alerts.
  enableLogs: true,

  // Bridge server-side pino warn/error records to Sentry Logs only. The bridge
  // never creates Sentry issues or fires alerts (error.levels is empty); the
  // explicit reportError channel remains the sole alerting path, so there is no
  // double-capture. See src/lib/sentry/pinoLogsConfig.ts.
  integrations: [Sentry.pinoIntegration(pinoLogsIntegrationOptions)],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

// Surface the image tag (branch tag for branch builds, release version for
// releases) on every event. Baked into the image as SQUAREONE_VERSION; see
// Dockerfile. Distinct from `release`, which is the git commit SHA.
Sentry.setContext('build', { version: process.env.SQUAREONE_VERSION });
