// This file configures the initialization of Sentry for server and edge runtimes.
// The config is imported by Next.js instrumentation hook when the server starts.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Type assertion for captureRequestError to handle version differences
export const onRequestError = (Sentry as any).captureRequestError;
