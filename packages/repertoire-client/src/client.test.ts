import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import {
  clearDiscoveryCache,
  fetchServiceDiscovery,
  getEmptyDiscovery,
  RepertoireError,
} from './client';
import { mockDiscovery } from './mock-discovery';
import { DiscoverySchema } from './schemas';

describe('fetchServiceDiscovery', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    clearDiscoveryCache(); // Clear cache before each test
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and validates discovery data successfully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDiscovery),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchServiceDiscovery(
      'https://example.com/repertoire'
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/repertoire/discovery',
      {
        cache: 'no-store',
      }
    );
    expect(result).toEqual(mockDiscovery);
    expect(result.applications).toContain('portal');
  });

  it('throws RepertoireError on 404 response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchServiceDiscovery('https://example.com/repertoire')
    ).rejects.toThrow(RepertoireError);

    await expect(
      fetchServiceDiscovery('https://example.com/repertoire')
    ).rejects.toMatchObject({
      message: 'Repertoire API error: 404 Not Found',
      statusCode: 404,
    });
  });

  it('throws RepertoireError on 500 response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchServiceDiscovery('https://example.com/repertoire')
    ).rejects.toThrow(RepertoireError);

    await expect(
      fetchServiceDiscovery('https://example.com/repertoire')
    ).rejects.toMatchObject({
      message: 'Repertoire API error: 500 Internal Server Error',
      statusCode: 500,
    });
  });

  it('throws ZodError when response has invalid URL', async () => {
    const invalidData = {
      services: {
        internal: {
          gafaelfawr: {
            url: 'not-a-valid-url',
          },
        },
        ui: {},
      },
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(invalidData),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchServiceDiscovery('https://example.com/repertoire')
    ).rejects.toThrow(ZodError);
  });

  it('throws ZodError when response is missing required fields', async () => {
    const invalidData = {
      // Missing 'services' which is required
      applications: ['portal'],
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(invalidData),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchServiceDiscovery('https://example.com/repertoire')
    ).rejects.toThrow(ZodError);
  });

  it('propagates network errors', async () => {
    const networkError = new Error('Network request failed');
    const mockFetch = vi.fn().mockRejectedValue(networkError);
    vi.stubGlobal('fetch', mockFetch);

    await expect(
      fetchServiceDiscovery('https://example.com/repertoire')
    ).rejects.toThrow('Network request failed');
  });
});

describe('getEmptyDiscovery', () => {
  it('returns empty discovery structure', () => {
    const empty = getEmptyDiscovery();

    expect(empty.applications).toEqual([]);
    expect(empty.datasets).toEqual({});
    expect(empty.influxdb_databases).toEqual({});
    expect(empty.services.internal).toEqual({});
    expect(empty.services.ui).toEqual({});
  });

  it('validates against DiscoverySchema', () => {
    const empty = getEmptyDiscovery();
    const result = DiscoverySchema.safeParse(empty);

    expect(result.success).toBe(true);
  });
});

describe('RepertoireError', () => {
  it('has correct error name', () => {
    const error = new RepertoireError('Test error');

    expect(error.name).toBe('RepertoireError');
  });

  it('stores status code', () => {
    const error = new RepertoireError('Not found', 404);

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
  });

  it('works without status code', () => {
    const error = new RepertoireError('Unknown error');

    expect(error.statusCode).toBeUndefined();
    expect(error.message).toBe('Unknown error');
  });

  it('is an instance of Error', () => {
    const error = new RepertoireError('Test error', 500);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RepertoireError);
  });
});
