/**
 * Tests for server-side Sentry startup: the instrumentation hook's
 * `register()` (instrumentation.ts) and `initServerSentry()`
 * (sentry.server.config.js), both at the app root.
 */

import * as Sentry from '@sentry/nextjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { register } from '../../../instrumentation';
import { initServerSentry } from '../../../sentry.server.config';
import logger from '../logger';
import { resolveServerSentryEnvironment } from './serverEnvironment';

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  setContext: vi.fn(),
  pinoIntegration: vi.fn(() => ({ name: 'Pino' })),
  captureRequestError: vi.fn(),
}));

vi.mock('../../../sentry.server.config', () => ({
  initServerSentry: vi.fn(),
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
});

describe('initServerSentry', () => {
  it('uses the given environment, not SQUAREONE_ENVIRONMENT_NAME', async () => {
    const actual = await vi.importActual<
      typeof import('../../../sentry.server.config')
    >('../../../sentry.server.config');

    actual.initServerSentry({ environment: 'idfdev' });

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({ environment: 'idfdev' })
    );
  });
});
