// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Git commit SHA baked into the image at build time (see Dockerfile). Unset
  // in local dev, where events carry a null release.
  release: process.env.SENTRY_RELEASE,

  environment: process.env.SQUAREONE_ENVIRONMENT_NAME || 'development',

  // Define how likely traces are sampled.
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

// Surface the image tag (branch tag for branch builds, release version for
// releases) on every event. Baked into the image as SQUAREONE_VERSION; see
// Dockerfile. Distinct from `release`, which is the git commit SHA.
Sentry.setContext('build', { version: process.env.SQUAREONE_VERSION });
