// Server-side reporting for RSC prefetch failures in `layout.tsx`.
//
// The root layout prefetches service discovery and broadcasts during
// server-side rendering. Some of those failures are handled inline (via the
// shared `reportingQueryFn` in the client packages), but the discovery-URL
// resolution feeding the broadcasts prefetch runs a raw `fetchServiceDiscovery`
// inside a `try/catch` that previously only pino-logged. This helper classifies
// such a caught error and, when it is report-worthy (contract drift, 5xx, or —
// server-side — a network failure), forwards it to Sentry so a silent prefetch
// outage still surfaces rather than living only in the server logs.

import { classifyError, type ReportContext } from '@lsst-sqre/api-client-core';
import { makeReportError } from './reportError';

/**
 * Report a server-side prefetch failure to Sentry when it is report-worthy.
 *
 * Always runs with `isServer: true`: this path only executes during RSC
 * rendering, so network-level failures are report-worthy (unlike in the
 * browser, where transient connectivity loss is routine). Expected failures
 * (401/403, other 4xx) are classified out and never reported.
 *
 * @param error - The caught error (typed `unknown`, as caught errors are).
 * @param context - Call-site tags forwarded to the reporter (e.g. `{ site }`).
 */
export function reportPrefetchError(
  error: unknown,
  context: ReportContext
): void {
  if (classifyError(error, { isServer: true }) === 'report-worthy') {
    makeReportError({ isServer: true })(error, context);
  }
}
