/**
 * Tests for server-side Sentry startup: the instrumentation hook's
 * `register()` (src/instrumentation.ts) and `initServerSentry()`
 * (sentry.server.config.js at the app root).
 */

import * as Sentry from '@sentry/nextjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initServerSentry } from '../../../sentry.server.config';
import { SENTRY_TUNNEL_ROUTE } from '../../../sentry.tunnel.config';
import { register } from '../../instrumentation';
import logger from '../logger';
import { installProcessWarningLogger } from '../server/processWarnings';
import { installTunnelResponseListenerLimit } from '../server/tunnelResponseListeners';
import { resolveServerSentryEnvironment } from './serverEnvironment';
import type { TracesSamplingContext } from './tracesSampler';

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  setContext: vi.fn(),
  pinoIntegration: vi.fn(() => ({ name: 'Pino' })),
  captureRequestError: vi.fn(),
}));

vi.mock('../../../sentry.server.config', () => ({
  initServerSentry: vi.fn(),
}));

vi.mock('../../../sentry.edge.config', () => ({}));

vi.mock('../server/tunnelResponseListeners', () => ({
  installTunnelResponseListenerLimit: vi.fn(),
}));

vi.mock('../server/processWarnings', () => ({
  installProcessWarningLogger: vi.fn(),
}));

vi.mock('./serverEnvironment', () => ({
  resolveServerSentryEnvironment: vi.fn(),
}));

vi.mock('../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  vi.stubEnv('SQUAREONE_ENVIRONMENT_NAME', 'from-env-var');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('register() in the Node.js runtime', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs');
    vi.mocked(resolveServerSentryEnvironment).mockResolvedValue('idfdev');
  });

  it('initializes server Sentry with the resolved environment', async () => {
    await register();

    expect(initServerSentry).toHaveBeenCalledWith({ environment: 'idfdev' });
  });

  it('logs the resolved environment in the startup line', async () => {
    await register();

    expect(logger.info).toHaveBeenCalledWith(
      { sentryEnvironment: 'idfdev' },
      'Squareone starting'
    );
  });

  it('raises the listener limit on Sentry tunnel responses', async () => {
    await register();

    expect(installTunnelResponseListenerLimit).toHaveBeenCalledWith({
      tunnelRoute: SENTRY_TUNNEL_ROUTE,
    });
  });

  it('installs the tunnel listener limit before initializing Sentry', async () => {
    await register();

    const [installOrder] = vi.mocked(installTunnelResponseListenerLimit).mock
      .invocationCallOrder;
    const [initOrder] = vi.mocked(initServerSentry).mock.invocationCallOrder;
    expect(installOrder).toBeLessThan(initOrder);
  });

  it('logs process warnings through the pino logger', async () => {
    await register();

    expect(installProcessWarningLogger).toHaveBeenCalledWith(logger);
  });

  it('installs the process warning logger before initializing Sentry', async () => {
    await register();

    const [installOrder] = vi.mocked(installProcessWarningLogger).mock
      .invocationCallOrder;
    const [initOrder] = vi.mocked(initServerSentry).mock.invocationCallOrder;
    expect(installOrder).toBeLessThan(initOrder);
  });
});

describe('register() in the edge runtime', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_RUNTIME', 'edge');
  });

  it('does not install the tunnel listener limit', async () => {
    await register();

    expect(installTunnelResponseListenerLimit).not.toHaveBeenCalled();
  });

  it('does not install the process warning logger', async () => {
    await register();

    expect(installProcessWarningLogger).not.toHaveBeenCalled();
  });
});

describe('initServerSentry', () => {
  /** Run the real initServerSentry and return the options it passed. */
  async function initOptions() {
    const actual = await vi.importActual<
      typeof import('../../../sentry.server.config')
    >('../../../sentry.server.config');
    actual.initServerSentry({ environment: 'idfdev' });
    const [options] = vi.mocked(Sentry.init).mock.calls[0];
    return options;
  }

  /** A root span sampling context for an incoming GET of `path`. */
  function requestContext(path: string): TracesSamplingContext {
    return {
      name: 'GET',
      attributes: { 'http.method': 'GET', 'http.target': path },
      normalizedRequest: { url: `http://10.1.2.3:3000${path}`, method: 'GET' },
      inheritOrSampleWith: (fallbackSampleRate) => fallbackSampleRate,
    };
  }

  it('uses the given environment, not SQUAREONE_ENVIRONMENT_NAME', async () => {
    const options = await initOptions();

    expect(options).toEqual(expect.objectContaining({ environment: 'idfdev' }));
  });

  it('never traces the health check, even at a sample rate of 1', async () => {
    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '1');

    const { tracesSampler } = await initOptions();

    expect(tracesSampler?.(requestContext('/api/health'))).toBe(0);
  });

  it('traces other requests at SENTRY_TRACES_SAMPLE_RATE', async () => {
    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '1');

    const { tracesSampler } = await initOptions();

    expect(tracesSampler?.(requestContext('/'))).toBe(1);
  });

  it('traces nothing when SENTRY_TRACES_SAMPLE_RATE is unset', async () => {
    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', undefined);

    const { tracesSampler } = await initOptions();

    expect(tracesSampler?.(requestContext('/'))).toBe(0);
  });

  it('keeps SENTRY_TRACES_SAMPLE_RATE as the fallback tracesSampleRate', async () => {
    vi.stubEnv('SENTRY_TRACES_SAMPLE_RATE', '0.5');

    const options = await initOptions();

    expect(options.tracesSampleRate).toBe(0.5);
  });
});
