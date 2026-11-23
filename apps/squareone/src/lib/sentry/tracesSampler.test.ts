import { describe, expect, it } from 'vitest';

import {
  getTracesSampleRate,
  type TracesSamplingContext,
} from './tracesSampler';

/**
 * Build a sampling context shaped like the one `@sentry/nextjs` 11 passes to
 * `tracesSampler` for the root span of an incoming request.
 *
 * Next.js starts that root span (`BaseServer.handleRequest`) itself, named
 * only by the HTTP method, with the raw request URL in `http.target`. The
 * Sentry HTTP integration has already put the request, with an absolute URL,
 * on the isolation scope, which the SDK passes as `normalizedRequest`.
 *
 * `inheritOrSampleWith` mirrors the SDK's implementation
 * (`@sentry/core` `tracing/sampling.js`): the upstream sample rate, else the
 * upstream decision, else the fallback.
 */
function requestContext(
  url: string,
  upstream: { parentSampled?: boolean; parentSampleRate?: number } = {}
): TracesSamplingContext {
  const { parentSampled, parentSampleRate } = upstream;
  return {
    name: 'GET',
    attributes: {
      'next.span_name': 'GET',
      'next.span_type': 'BaseServer.handleRequest',
      'http.method': 'GET',
      'http.target': url,
      'sentry.kind': 'server',
    },
    normalizedRequest: { url: `http://10.1.2.3:3000${url}`, method: 'GET' },
    parentSampled,
    parentSampleRate,
    inheritOrSampleWith: (fallbackSampleRate) => {
      if (typeof parentSampleRate === 'number') return parentSampleRate;
      if (typeof parentSampled === 'boolean') return Number(parentSampled);
      return fallbackSampleRate;
    },
  };
}

describe('getTracesSampleRate', () => {
  it('never samples a request to the health check', () => {
    expect(getTracesSampleRate(requestContext('/api/health'), 1)).toBe(0);
  });

  it('samples any other request at the configured rate', () => {
    expect(getTracesSampleRate(requestContext('/'), 0.25)).toBe(0.25);
  });

  it('follows an upstream sampling decision for any other request', () => {
    const upstreamSampled = requestContext('/', {
      parentSampled: true,
      parentSampleRate: 0.5,
    });

    expect(getTracesSampleRate(upstreamSampled, 0)).toBe(0.5);
  });

  it('drops the health check even when the upstream trace was sampled', () => {
    const upstreamSampled = requestContext('/api/health', {
      parentSampled: true,
      parentSampleRate: 1,
    });

    expect(getTracesSampleRate(upstreamSampled, 1)).toBe(0);
  });

  it('drops the health check when the request has a query string', () => {
    expect(
      getTracesSampleRate(requestContext('/api/health?probe=liveness'), 1)
    ).toBe(0);
  });

  it('samples routes that only share a prefix with the health check', () => {
    expect(getTracesSampleRate(requestContext('/api/healthz'), 1)).toBe(1);
  });

  it('recognizes the health check from the normalized request alone', () => {
    const context = requestContext('/api/health');
    delete context.attributes['http.target'];

    expect(getTracesSampleRate(context, 1)).toBe(0);
  });

  it('recognizes the health check from a url.path attribute', () => {
    // The shape of a root span from Sentry's own HTTP server instrumentation,
    // which uses the current OpenTelemetry convention instead of http.target.
    const context: TracesSamplingContext = {
      name: 'GET',
      attributes: { 'sentry.op': 'http.server', 'url.path': '/api/health' },
      inheritOrSampleWith: (fallbackSampleRate) => fallbackSampleRate,
    };

    expect(getTracesSampleRate(context, 1)).toBe(0);
  });

  it('samples a root span that is not for a request at the configured rate', () => {
    const context: TracesSamplingContext = {
      name: 'startup',
      attributes: {},
      inheritOrSampleWith: (fallbackSampleRate) => fallbackSampleRate,
    };

    expect(getTracesSampleRate(context, 0.25)).toBe(0.25);
  });
});
