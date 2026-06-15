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
