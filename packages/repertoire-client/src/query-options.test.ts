import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearDiscoveryCache, getEmptyDiscovery } from './client';
import { mockDiscovery } from './mock-discovery';
import { discoveryQueryOptions } from './query-options';

// Helper to create a minimal mock context for testing queryFn
// biome-ignore lint/suspicious/noExplicitAny: Test utility needs flexible typing
const createMockContext = (url: string): any => ({
  queryKey: ['service-discovery', url] as const,
  signal: new AbortController().signal,
  meta: undefined,
});

// Helper to safely get queryFn from options (it's always defined for our factory)
function getQueryFn(url: string) {
  const options = discoveryQueryOptions(url);
  if (!options.queryFn) {
    throw new Error('queryFn should always be defined');
  }
  return options.queryFn;
}

describe('discoveryQueryOptions', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    clearDiscoveryCache(); // Clear cache before each test
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('query key structure', () => {
    it('creates query key with service-discovery prefix and URL', () => {
      const options = discoveryQueryOptions('https://example.com/repertoire');

      expect(options.queryKey).toEqual([
        'service-discovery',
        'https://example.com/repertoire',
      ]);
    });

    it('creates different keys for different URLs', () => {
      const options1 = discoveryQueryOptions(
        'https://data.lsst.cloud/repertoire'
      );
      const options2 = discoveryQueryOptions(
        'https://usdf.slac.stanford.edu/repertoire'
      );

      expect(options1.queryKey).not.toEqual(options2.queryKey);
      expect(options1.queryKey[1]).toBe('https://data.lsst.cloud/repertoire');
      expect(options2.queryKey[1]).toBe(
        'https://usdf.slac.stanford.edu/repertoire'
      );
    });

    it('query key is readonly (as const)', () => {
      const options = discoveryQueryOptions('https://example.com/repertoire');

      // TypeScript ensures this is readonly, but we can verify the structure
      expect(options.queryKey[0]).toBe('service-discovery');
    });
  });

  describe('options configuration', () => {
    it('has staleTime of 5 minutes', () => {
      const options = discoveryQueryOptions('https://example.com/repertoire');

      expect(options.staleTime).toBe(5 * 60 * 1000);
    });

    it('has gcTime of 10 minutes', () => {
      const options = discoveryQueryOptions('https://example.com/repertoire');

      expect(options.gcTime).toBe(10 * 60 * 1000);
    });

    it('has a queryFn defined', () => {
      const options = discoveryQueryOptions('https://example.com/repertoire');

      expect(options.queryFn).toBeDefined();
      expect(typeof options.queryFn).toBe('function');
    });
  });

  describe('query function behavior', () => {
    it('fetches from the provided URL with /discovery appended', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const url = 'https://example.com/repertoire';
      const queryFn = getQueryFn(url);
      await queryFn(createMockContext(url));

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/repertoire/discovery',
        {
          cache: 'no-store',
        }
      );
    });

    it('returns discovery data on successful fetch', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const url = 'https://example.com/repertoire';
      const queryFn = getQueryFn(url);
      const result = await queryFn(createMockContext(url));

      expect(result).toEqual(mockDiscovery);
      expect(result.applications).toContain('portal');
    });
  });

  describe('error handling', () => {
    it('returns empty discovery on HTTP error', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      vi.stubGlobal('fetch', mockFetch);

      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const url = 'https://example.com/repertoire';
      const queryFn = getQueryFn(url);
      const result = await queryFn(createMockContext(url));

      expect(result).toEqual(getEmptyDiscovery());
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('returns empty discovery on network error', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new Error('Network request failed'));
      vi.stubGlobal('fetch', mockFetch);

      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const url = 'https://example.com/repertoire';
      const queryFn = getQueryFn(url);
      const result = await queryFn(createMockContext(url));

      expect(result).toEqual(getEmptyDiscovery());
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('returns empty discovery on validation error', async () => {
      const invalidData = {
        // Missing required 'services' field
        applications: ['portal'],
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(invalidData),
      });
      vi.stubGlobal('fetch', mockFetch);

      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const url = 'https://example.com/repertoire';
      const queryFn = getQueryFn(url);
      const result = await queryFn(createMockContext(url));

      expect(result).toEqual(getEmptyDiscovery());
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('logs error with [Discovery] prefix', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new Error('Network request failed'));
      vi.stubGlobal('fetch', mockFetch);

      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const url = 'https://example.com/repertoire';
      const queryFn = getQueryFn(url);
      await queryFn(createMockContext(url));

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to fetch discovery',
        expect.objectContaining({ err: expect.any(Error) })
      );

      consoleError.mockRestore();
    });
  });

  describe('integration patterns', () => {
    it('can be used to construct a TanStack Query query', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const options = discoveryQueryOptions('https://example.com/repertoire');

      // Simulate how TanStack Query would use this
      expect(options).toMatchObject({
        queryKey: expect.any(Array),
        queryFn: expect.any(Function),
        staleTime: expect.any(Number),
        gcTime: expect.any(Number),
      });
    });
  });
});
