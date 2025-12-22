import type { SentryConfig, StaticConfig } from '../lib/config/rsc';

type SentryConfigScriptProps = {
  config: StaticConfig;
};

/**
 * Server component that injects Sentry configuration into the browser.
 *
 * This replaces the _document.tsx pattern for App Router. The client-side
 * Sentry instrumentation (instrumentation-client.js) reads from
 * window.__SENTRY_CONFIG__ to initialize with runtime configuration.
 *
 * This enables Sentry DSN and other settings to be configured at runtime
 * via Kubernetes ConfigMaps rather than at build time.
 */
export default function SentryConfigScript({
  config,
}: SentryConfigScriptProps) {
  const sentryConfig: SentryConfig = {
    dsn: config.sentryDsn,
    environment: config.environmentName,
    tracesSampleRate: config.sentryTracesSampleRate,
    replaysSessionSampleRate: config.sentryReplaysSessionSampleRate,
    replaysOnErrorSampleRate: config.sentryReplaysOnErrorSampleRate,
    baseUrl: config.baseUrl,
  };

  // Only inject the script if we have Sentry configuration
  if (!sentryConfig.dsn) {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__SENTRY_CONFIG__ = ${JSON.stringify(sentryConfig)};`,
      }}
    />
  );
}
