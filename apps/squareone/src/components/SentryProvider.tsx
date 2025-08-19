/**
 * Sentry Provider component that initializes Sentry with AppConfig data
 * This replaces the instrumentation-client.js approach for client-side Sentry initialization
 */
import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useAppConfig } from '../contexts/AppConfigContext';

type SentryProviderProps = {
  children: React.ReactNode;
};

export function SentryProvider({ children }: SentryProviderProps) {
  const config = useAppConfig();

  useEffect(() => {
    // Check if Sentry is already initialized to prevent multiple instances
    if (Sentry.getClient()) {
      return;
    }

    // Initialize Sentry with configuration from AppConfig
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.environmentName,

      // Add optional integrations for additional features
      integrations: [Sentry.replayIntegration()],

      // Trace requests through any other Sentry-enabled service in the same
      // environment. By default, only requests to 'localhost' and requests that
      // start with '/' have trace headers added. Many of our requests to external
      // services use the fully qualified URL.
      tracePropagationTargets: [config.baseUrl],

      // Define how likely traces are sampled. Adjust this value in production, or
      // use tracesSampler for greater control.
      tracesSampleRate: config.sentryTracesSampleRate || 0,

      // Define how likely Replay events are sampled.
      replaysSessionSampleRate: config.sentryReplaysSessionSampleRate || 0,

      // Define how likely Replay events are sampled when an error occurs.
      replaysOnErrorSampleRate: config.sentryReplaysOnErrorSampleRate || 1.0,

      // Setting this option to true will print useful information to the console
      // while you're setting up Sentry.
      debug: config.sentryDebug || false,
    });
  }, [config]);

  return <>{children}</>;
}

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
