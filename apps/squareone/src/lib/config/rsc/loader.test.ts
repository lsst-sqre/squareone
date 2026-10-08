import {
  fetchServiceDiscovery,
  mockDiscovery,
  mockDiscovery2x,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { headers } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import logger from '../../logger';
import { type AppConfig, loadAppConfig } from '../loader';
import { getStaticConfig } from './loader';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  fetchServiceDiscovery: vi.fn(),
}));

vi.mock('../loader', () => ({
  loadAppConfig: vi.fn(),
  loadMdxContent: vi.fn(),
}));

vi.mock('../../logger', () => ({
  default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const REPERTOIRE_URL = 'https://data.example.org/repertoire';

// Config that sets every discovery-backed key, so none needs discovery.
const explicitKeys: Partial<AppConfig> = {
  siteName: 'Configured Site',
  environmentName: 'configured-env',
  baseUrl: 'https://configured.example.org',
  timesSquareUrl: 'https://configured.example.org/times-square/api',
};

const requestHeaders = new Headers({
  'x-forwarded-proto': 'https',
  'x-forwarded-host': 'data.example.org',
});

// A Repertoire 2.x-shaped document: no environment and no squareone UI URL.
const discovery2: ServiceDiscovery = (() => {
  const d = structuredClone(mockDiscovery);
  delete d.environment;
  delete d.services.ui.squareone;
  return d;
})();

function givenConfig(config: Partial<AppConfig>) {
  vi.mocked(loadAppConfig).mockResolvedValue({
    siteDescription: 'Welcome',
    ...config,
  } as AppConfig);
}

describe('getStaticConfig', () => {
  beforeEach(() => {
    vi.mocked(fetchServiceDiscovery).mockReset();
    vi.mocked(headers).mockReset();
    vi.mocked(headers).mockResolvedValue(
      requestHeaders as unknown as Awaited<ReturnType<typeof headers>>
    );
  });

  it('fills omitted keys from Repertoire discovery', async () => {
    givenConfig({ repertoireUrl: REPERTOIRE_URL });
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    const config = await getStaticConfig();

    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      REPERTOIRE_URL,
      expect.anything()
    );
    expect(config).toMatchObject({
      siteName: 'US Rubin Science Platform',
      environmentName: 'idfprod',
      baseUrl: 'https://data.lsst.cloud',
      timesSquareUrl: 'https://data.lsst.cloud/times-square/api',
      siteDescription: 'Welcome',
    });
  });

  it('does not read request headers when discovery supplies baseUrl', async () => {
    givenConfig({ repertoireUrl: REPERTOIRE_URL });
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    await getStaticConfig();

    expect(headers).not.toHaveBeenCalled();
  });

  it('keeps explicit config values without fetching discovery', async () => {
    givenConfig({ repertoireUrl: REPERTOIRE_URL, ...explicitKeys });

    const config = await getStaticConfig();

    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
    expect(headers).not.toHaveBeenCalled();
    expect(config).toMatchObject(explicitKeys);
  });

  it('fetches discovery when only timesSquareUrl is unset', async () => {
    givenConfig({
      repertoireUrl: REPERTOIRE_URL,
      ...explicitKeys,
      timesSquareUrl: undefined,
    });
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery2x);

    const config = await getStaticConfig();

    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      REPERTOIRE_URL,
      expect.anything()
    );
    expect(headers).not.toHaveBeenCalled();
    expect(config).toMatchObject({
      ...explicitKeys,
      timesSquareUrl: 'https://data.lsst.cloud/times-square/api',
    });
  });

  it('derives baseUrl from request headers when discovery lacks squareone', async () => {
    givenConfig({ repertoireUrl: REPERTOIRE_URL });
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(discovery2);

    const config = await getStaticConfig();

    expect(headers).toHaveBeenCalled();
    expect(config).toMatchObject({
      siteName: 'Rubin Science Platform',
      environmentName: 'unknown',
      baseUrl: 'https://data.example.org',
    });
  });

  it('falls back without failing when discovery is unavailable', async () => {
    givenConfig({ repertoireUrl: REPERTOIRE_URL });
    const error = new Error('connection refused');
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const config = await getStaticConfig();

    expect(config).toMatchObject({
      siteName: 'Rubin Science Platform',
      environmentName: 'unknown',
      baseUrl: 'https://data.example.org',
    });
    expect(config.timesSquareUrl).toBeUndefined();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ err: error }),
      expect.any(String)
    );
  });

  it('skips discovery when repertoireUrl is unset', async () => {
    givenConfig({});

    const config = await getStaticConfig();

    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
    expect(config).toMatchObject({
      siteName: 'Rubin Science Platform',
      environmentName: 'unknown',
      baseUrl: 'https://data.example.org',
    });
    expect(config.timesSquareUrl).toBeUndefined();
  });
});
