// This file configures the initialization of Sentry for server and edge runtimes.
// The config is imported by Next.js instrumentation hook when the server starts.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Resolve the Sentry environment the same way as the browser's injected
    // config (config, then Repertoire discovery, then the fallback) before
    // Sentry starts, so server and browser events agree. The discovery fetch
    // is bounded, so an unavailable Repertoire can't hold up startup.
    const { resolveServerSentryEnvironment } = await import(
      './src/lib/sentry/serverEnvironment'
    );
    const environment = await resolveServerSentryEnvironment();

    const { initServerSentry } = await import('./sentry.server.config');
    initServerSentry({ environment });

    // Emit a one-time startup line carrying the build's version + revision
    // (bound as base fields on the logger) and the resolved Sentry
    // environment. Imported dynamically because the Pino logger is Node-only
    // and register() also runs in the edge runtime.
    const { default: logger } = await import('./src/lib/logger');
    logger.info({ sentryEnvironment: environment }, 'Squareone starting');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Type assertion for captureRequestError to handle version differences
export const onRequestError = (
  Sentry as unknown as { captureRequestError: unknown }
).captureRequestError;
