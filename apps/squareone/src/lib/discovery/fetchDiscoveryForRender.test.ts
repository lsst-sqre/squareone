import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock only fetchServiceDiscovery; keep the real mock data and types from the
// client package.
vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@lsst-sqre/repertoire-client')>();
  return {
    ...actual,
    fetchServiceDiscovery: vi.fn(),
  };
});

import {
  fetchServiceDiscovery,
  mockDiscovery,
  RepertoireError,
} from '@lsst-sqre/repertoire-client';

import { fetchDiscoveryForRender } from './fetchDiscoveryForRender';

function makeLogger() {
  return { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

const callSite = { site: 'test-discovery', purpose: 'the test page' };

describe('fetchDiscoveryForRender', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('omits discovery when no repertoireUrl is configured', async () => {
    const result = await fetchDiscoveryForRender({
      repertoireUrl: undefined,
      ...callSite,
    });

    expect(result).toEqual({ status: 'omitted' });
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });

  test('returns the discovery document when the fetch succeeds', async () => {
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    const result = await fetchDiscoveryForRender({
      repertoireUrl: 'https://example.org/repertoire',
      ...callSite,
    });

    expect(result).toEqual({ status: 'ok', discovery: mockDiscovery });
  });

  test('threads the logger into the discovery fetch', async () => {
    const logger = makeLogger();
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    await fetchDiscoveryForRender({
      repertoireUrl: 'https://example.org/repertoire',
      logger,
      ...callSite,
    });

    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      'https://example.org/repertoire',
      { logger }
    );
  });

  test('returns unavailable and logs the purpose and context when the fetch fails', async () => {
    const logger = makeLogger();
    const error = new Error('discovery exploded');
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const result = await fetchDiscoveryForRender({
      repertoireUrl: 'https://example.org/repertoire',
      logger,
      ...callSite,
      context: { service: 'comanage' },
    });

    expect(result).toEqual({ status: 'unavailable' });
    expect(logger.error).toHaveBeenCalledWith(
      { err: error, service: 'comanage' },
      'Failed to fetch service discovery for the test page'
    );
  });

  test('reports a report-worthy failure tagged with the site, package, and context', async () => {
    const reportError = vi.fn();
    // A 5xx is report-worthy per classifyError (upstream server failure).
    const error = new RepertoireError('discovery exploded', 503);
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const result = await fetchDiscoveryForRender({
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
      ...callSite,
      context: { service: 'comanage' },
    });

    // The fallback is unchanged: still 'unavailable'.
    expect(result).toEqual({ status: 'unavailable' });
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(error, {
      site: 'test-discovery',
      package: 'squareone',
      service: 'comanage',
    });
  });

  test('does not report an expected failure (403)', async () => {
    const reportError = vi.fn();
    // A 403 is expected per classifyError (auth failures are routine).
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(
      new RepertoireError('forbidden', 403)
    );

    const result = await fetchDiscoveryForRender({
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
      ...callSite,
    });

    expect(result).toEqual({ status: 'unavailable' });
    expect(reportError).not.toHaveBeenCalled();
  });

  test('reports a server-side network failure (no status code)', async () => {
    const reportError = vi.fn();
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(
      new TypeError('fetch failed')
    );

    await fetchDiscoveryForRender({
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
      ...callSite,
    });

    // Server-side classification: network failures are report-worthy.
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});
