import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  fetchServiceDiscovery,
  mockDiscovery,
} from '@lsst-sqre/repertoire-client';
import { load } from 'js-yaml';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type AppConfig, loadAppConfig } from '../config/loader';
import { DEFAULT_ENVIRONMENT_NAME } from '../config/resolveConfigDefaults';
import logger from '../logger';
import {
  resolveServerSentryEnvironment,
  STARTUP_DISCOVERY_TIMEOUT_MS,
} from './serverEnvironment';

vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  fetchServiceDiscovery: vi.fn(),
}));

vi.mock('../config/loader', () => ({ loadAppConfig: vi.fn() }));

vi.mock('../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Resolve the app-root config files relative to this test (src/lib/sentry/).
const appRoot = join(__dirname, '../../../');

const REPERTOIRE_URL = 'https://data.example.org/repertoire';

function givenConfig(config: Partial<AppConfig>) {
  vi.mocked(loadAppConfig).mockResolvedValue({
    siteDescription: 'Welcome',
    ...config,
  } as AppConfig);
}

describe('resolveServerSentryEnvironment', () => {
  beforeEach(() => {
    vi.mocked(fetchServiceDiscovery).mockReset();
    vi.mocked(logger.warn).mockClear();
  });

  it('uses the configured environmentName without fetching discovery', async () => {
    givenConfig({
      repertoireUrl: REPERTOIRE_URL,
      environmentName: 'configured-env',
    });

    const environment = await resolveServerSentryEnvironment();

    expect(environment).toBe('configured-env');
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });

  it('reports the local dev config environmentName', async () => {
    const devConfig = load(
      readFileSync(join(appRoot, 'squareone.config.yaml'), 'utf8')
    ) as AppConfig;
    vi.mocked(loadAppConfig).mockResolvedValue(devConfig);

    const environment = await resolveServerSentryEnvironment();

    expect(environment).toBe('development');
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });

  it('uses the discovery environment label when environmentName is omitted', async () => {
    givenConfig({ repertoireUrl: REPERTOIRE_URL });
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    const environment = await resolveServerSentryEnvironment();

    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      REPERTOIRE_URL,
      expect.anything()
    );
    expect(environment).toBe('idfprod');
  });

  it('falls back without fetching discovery when repertoireUrl is unset', async () => {
    givenConfig({});

    const environment = await resolveServerSentryEnvironment();

    expect(environment).toBe(DEFAULT_ENVIRONMENT_NAME);
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });

  it('falls back and logs a warning when discovery fails', async () => {
    givenConfig({ repertoireUrl: REPERTOIRE_URL });
    const error = new Error('connection refused');
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const environment = await resolveServerSentryEnvironment();

    expect(environment).toBe(DEFAULT_ENVIRONMENT_NAME);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ err: error, repertoireUrl: REPERTOIRE_URL }),
      expect.any(String)
    );
  });

  describe('with a slow Repertoire', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('stops waiting at the timeout, falls back, and logs a warning', async () => {
      givenConfig({ repertoireUrl: REPERTOIRE_URL });
      // A fetch that never settles, as with an unresponsive Repertoire.
      vi.mocked(fetchServiceDiscovery).mockReturnValue(new Promise(() => {}));

      const result = resolveServerSentryEnvironment();
      await vi.advanceTimersByTimeAsync(STARTUP_DISCOVERY_TIMEOUT_MS);

      await expect(result).resolves.toBe(DEFAULT_ENVIRONMENT_NAME);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          repertoireUrl: REPERTOIRE_URL,
          timeoutMs: STARTUP_DISCOVERY_TIMEOUT_MS,
        }),
        expect.any(String)
      );
    });
  });
});
