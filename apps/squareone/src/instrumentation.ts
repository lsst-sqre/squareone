import * as Sentry from '@sentry/nextjs';

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
}

// Type assertion for captureRequestError to handle version differences
export const onRequestError = (Sentry as any).captureRequestError;
