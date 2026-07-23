import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock only fetchServiceDiscovery; keep the real mock data, types, and
// transform inputs from the client package.
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

import { resolveApiEndpoints } from './resolve';
import { serviceDiscoveryToApiEndpointGroups } from './transform';

function makeLogger() {
  return { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

describe('resolveApiEndpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('omits the listing when no repertoireUrl is configured', async () => {
    const result = await resolveApiEndpoints({ repertoireUrl: undefined });

    expect(result).toEqual({ status: 'omitted' });
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });

  test('returns ok groups when discovery succeeds', async () => {
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    const result = await resolveApiEndpoints({
      repertoireUrl: 'https://example.org/repertoire',
    });

    expect(result).toEqual({
      status: 'ok',
      groups: serviceDiscoveryToApiEndpointGroups(mockDiscovery),
    });
  });

  test('returns unavailable and logs the error when discovery fails', async () => {
    const logger = makeLogger();
    const error = new Error('discovery exploded');
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const result = await resolveApiEndpoints({
      repertoireUrl: 'https://example.org/repertoire',
      logger,
    });

    expect(result).toEqual({ status: 'unavailable' });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: error }),
      expect.any(String)
    );
  });

  test('reports a report-worthy discovery failure with call-site context', async () => {
    const reportError = vi.fn();
    // A 5xx is report-worthy per classifyError (upstream server failure).
    const error = new RepertoireError('discovery exploded', 503);
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(error);

    const result = await resolveApiEndpoints({
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
    });

    // UI fallback is unchanged: still 'unavailable'.
    expect(result).toEqual({ status: 'unavailable' });
    expect(reportError).toHaveBeenCalledTimes(1);
    const [reported, context] = reportError.mock.calls[0];
    expect(reported).toBe(error);
    expect(context).toMatchObject({ site: 'api-aspect-discovery' });
  });

  test('does not report an expected discovery failure (403)', async () => {
    const reportError = vi.fn();
    // A 403 is expected per classifyError (auth failures are routine).
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(
      new RepertoireError('forbidden', 403)
    );

    const result = await resolveApiEndpoints({
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
    });

    // UI fallback is unchanged: still 'unavailable'.
    expect(result).toEqual({ status: 'unavailable' });
    expect(reportError).not.toHaveBeenCalled();
  });

  test('reports a server-side network failure (no status code)', async () => {
    const reportError = vi.fn();
    vi.mocked(fetchServiceDiscovery).mockRejectedValue(
      new TypeError('fetch failed')
    );

    await resolveApiEndpoints({
      repertoireUrl: 'https://example.org/repertoire',
      reportError,
    });

    // Server-side classification: network failures are report-worthy.
    expect(reportError).toHaveBeenCalledTimes(1);
  });

  test('threads the logger into the discovery fetch', async () => {
    const logger = makeLogger();
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);

    await resolveApiEndpoints({
      repertoireUrl: 'https://example.org/repertoire',
      logger,
    });

    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      'https://example.org/repertoire',
      { logger }
    );
  });
});
