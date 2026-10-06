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

// The shared fetch/log/report handling is covered in
// lib/discovery/fetchDiscoveryForRender.test.ts; these tests cover the wiring:
// the call-site log message and Sentry site, and the transform of the result.
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
      'Failed to fetch service discovery for /api-aspect'
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
    expect(context).toMatchObject({
      site: 'api-aspect-discovery',
      package: 'squareone',
    });
  });
});
