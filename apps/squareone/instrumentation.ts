// This file configures the initialization of Sentry for server and edge runtimes.
// The config is imported by Next.js instrumentation hook when the server starts.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');

    // Emit a one-time startup line carrying the build's version + revision
    // (bound as base fields on the logger). Imported dynamically because the
    // Pino logger is Node-only and register() also runs in the edge runtime.
    const { default: logger } = await import('./src/lib/logger');
    logger.info('Squareone starting');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Type assertion for captureRequestError to handle version differences
export const onRequestError = (
  Sentry as unknown as { captureRequestError: unknown }
).captureRequestError;
