/**
 * The trace sampling decision for the Node.js server's Sentry
 * `tracesSampler` (sentry.server.config.js).
 *
 * Every request to the health check (`GET /api/health`, see
 * src/app/api/health/route.ts) is dropped from tracing. The Kubernetes liveness
 * and readiness probes call it every few seconds, and some environments trace
 * at a sample rate of 1, so each probe would otherwise become a Sentry
 * transaction. Every other root span is sampled exactly as the configured
 * `tracesSampleRate` alone would sample it.
 */

import type * as Sentry from '@sentry/nextjs';

type TracesSampler = NonNullable<
  NonNullable<Parameters<typeof Sentry.init>[0]>['tracesSampler']
>;

/** The context the Sentry SDK passes to `tracesSampler` for a root span. */
export type TracesSamplingContext = Parameters<TracesSampler>[0];

/** The path of the health check route (src/app/api/health/route.ts). */
export const HEALTH_CHECK_PATH = '/api/health';

/**
 * The path of a request URL, which may be a bare path with a query string
 * (`/api/health?probe=liveness`) or an absolute URL. Returns undefined if it
 * can't be parsed.
 */
function toPathname(url: string): string | undefined {
  try {
    return new URL(url, 'http://localhost').pathname;
  } catch {
    return undefined;
  }
}

/**
 * Whether a root span is for a request to the health check.
 *
 * At sampling time the span is named only by its HTTP method (`GET`), so the
 * path has to come from elsewhere in the sampling context. Any of these
 * identifies the request:
 *
 * - `normalizedRequest.url`: the incoming request with an absolute URL, which
 *   Sentry's HTTP integration records for every request (the SDK's documented
 *   field for this).
 * - `http.target`: the raw request URL that Next.js sets on the
 *   `BaseServer.handleRequest` root span it starts for each request.
 * - `url.path`: the current OpenTelemetry convention, which Sentry's own HTTP
 *   server spans use (Next.js disables those today).
 */
function isHealthCheckRequest(samplingContext: TracesSamplingContext): boolean {
  const { attributes, normalizedRequest } = samplingContext;
  const urls = [
    normalizedRequest?.url,
    attributes['http.target'],
    attributes['url.path'],
  ];
  return urls.some(
    (url) => typeof url === 'string' && toPathname(url) === HEALTH_CHECK_PATH
  );
}

/**
 * Decide the trace sample rate for a root span.
 *
 * @param samplingContext - The context the SDK passes to `tracesSampler`.
 * @param configuredRate - The configured `tracesSampleRate`
 *   (`SENTRY_TRACES_SAMPLE_RATE`).
 * @returns 0 for a request to the health check, even when an upstream service
 *   sampled the trace. Otherwise the upstream service's sampling decision if
 *   the request continues a trace, else `configuredRate`, via the SDK's
 *   `inheritOrSampleWith`, which is how a `tracesSampler` keeps the SDK's
 *   default behaviour of following the upstream decision.
 */
export function getTracesSampleRate(
  samplingContext: TracesSamplingContext,
  configuredRate: number
): number {
  if (isHealthCheckRequest(samplingContext)) {
    return 0;
  }
  return samplingContext.inheritOrSampleWith(configuredRate);
}
