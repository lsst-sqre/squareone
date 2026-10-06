// This file configures the initialization of Sentry for server and edge runtimes.
// The config is imported by Next.js instrumentation hook when the server starts.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Work around vercel/next.js#97757 (Next 16.3 warns
    // MaxListenersExceededWarning on every Sentry tunnel request) by raising
    // the listener limit on tunnel responses only. Installed first, before
    // Sentry and before the server takes requests, so the diagnostics channel
    // subscription sees every tunnel request. See the module for the removal
    // condition.
    const { installTunnelResponseListenerLimit } = await import(
      './src/lib/server/tunnelResponseListeners'
    );
    const { SENTRY_TUNNEL_ROUTE } = await import('./sentry.tunnel.config');
    installTunnelResponseListenerLimit({ tunnelRoute: SENTRY_TUNNEL_ROUTE });

    // The Pino logger is Node-only (register() also runs in the edge runtime),
    // so it is imported dynamically.
    const { default: logger } = await import('./src/lib/logger');

    // Log Node process warnings through pino as well as stderr, so the Sentry
    // pino bridge ships them to Sentry Logs. Installed before Sentry and
    // before the server takes requests, so startup warnings are logged too.
    const { installProcessWarningLogger } = await import(
      './src/lib/server/processWarnings'
    );
    installProcessWarningLogger(logger);

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
    // environment.
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
