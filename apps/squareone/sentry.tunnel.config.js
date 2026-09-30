// The same-origin path that the browser Sentry SDK posts its envelopes to
// (Sentry's `tunnelRoute`), which Next.js rewrites to Sentry's ingest host.
// This is the single source of truth: next.config.js passes it to
// withSentryConfig, and instrumentation.ts passes it to the server-side
// workaround in src/lib/server/tunnelResponseListeners.ts.
//
// CommonJS because next.config.js loads it with require().

const SENTRY_TUNNEL_ROUTE = '/monitoring';

module.exports = { SENTRY_TUNNEL_ROUTE };
