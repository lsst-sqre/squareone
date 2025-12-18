import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getEmptyDiscovery } from '../client';
import { mockDiscovery } from '../mock-discovery';
import { ServiceDiscoveryQuery } from '../query';
import { useServiceDiscovery } from './useServiceDiscovery';

// Create a fresh QueryClient wrapper for each test
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests
      },
    },
  });
  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

describe('useServiceDiscovery', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('successful fetch', () => {
    it('returns discovery data after successful fetch', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(result.current.discovery).toEqual(mockDiscovery);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('provides a ServiceDiscoveryQuery instance when data is available', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(result.current.query).toBeInstanceOf(ServiceDiscoveryQuery);
      expect(result.current.query?.hasApplication('portal')).toBe(true);
      expect(result.current.query?.getPortalUrl()).toBe(
        'https://data.lsst.cloud/portal/app'
      );
    });
  });

  describe('loading state', () => {
    it('isPending is true during initial fetch', async () => {
      // Create a deferred fetch to control timing
      const deferred: { resolve: (value: unknown) => void } = {
        resolve: () => {},
      };
      const fetchPromise = new Promise((resolve) => {
        deferred.resolve = resolve;
      });
      const mockFetch = vi.fn().mockReturnValue(fetchPromise);
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      // Check initial loading state
      expect(result.current.isPending).toBe(true);
      expect(result.current.discovery).toBeUndefined();
      expect(result.current.query).toBeNull();

      // Resolve the fetch to clean up
      deferred.resolve({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });

    it('query is null when data is undefined', async () => {
      // Create a deferred fetch to control timing
      const deferred: { resolve: (value: unknown) => void } = {
        resolve: () => {},
      };
      const fetchPromise = new Promise((resolve) => {
        deferred.resolve = resolve;
      });
      const mockFetch = vi.fn().mockReturnValue(fetchPromise);
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      expect(result.current.query).toBeNull();

      // Clean up
      deferred.resolve({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe('error handling (graceful degradation)', () => {
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

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      // Due to graceful degradation in discoveryQueryOptions,
      // errors are caught and empty discovery is returned
      expect(result.current.discovery).toEqual(getEmptyDiscovery());
      expect(result.current.isError).toBe(false);

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

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(result.current.discovery).toEqual(getEmptyDiscovery());
      expect(result.current.isError).toBe(false);

      consoleError.mockRestore();
    });

    it('returns empty discovery on validation error', async () => {
      const invalidData = {
        // Missing required fields
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

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(result.current.discovery).toEqual(getEmptyDiscovery());
      expect(result.current.isError).toBe(false);

      consoleError.mockRestore();
    });
  });

  describe('query helper', () => {
    it('can use query methods to check applications', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      const { query } = result.current;
      expect(query).not.toBeNull();
      expect(query?.hasApplication('portal')).toBe(true);
      expect(query?.hasApplication('nonexistent')).toBe(false);
      expect(query?.getApplications()).toContain('portal');
    });

    it('can use query methods to get service URLs', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      const { query } = result.current;
      expect(query?.getUiServiceUrl('portal')).toBe(
        'https://data.lsst.cloud/portal/app'
      );
      expect(query?.getInternalServiceUrl('gafaelfawr')).toBe(
        'https://data.lsst.cloud/auth/api/v1'
      );
      expect(query?.getSemaphoreUrl()).toBe(
        'https://data.lsst.cloud/semaphore'
      );
    });

    it('can use query methods to access datasets', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      const { query } = result.current;
      expect(query?.hasDataset('dp0.2')).toBe(true);
      expect(query?.getDataset('dp0.2')?.description).toBe('Data Preview 0.2');
    });
  });

  describe('refetch', () => {
    it('provides a refetch function', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('calling refetch triggers a new fetch', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      const initialCallCount = mockFetch.mock.calls.length;

      // Trigger refetch
      await result.current.refetch();

      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('URL reactivity', () => {
    it('fetches from different URLs when repertoireUrl changes', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result, rerender } = renderHook(
        ({ url }: { url: string }) => useServiceDiscovery(url),
        {
          initialProps: { url: 'https://example.com/discovery1' },
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/discovery1',
        expect.any(Object)
      );

      // Change URL
      rerender({ url: 'https://example.com/discovery2' });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'https://example.com/discovery2',
          expect.any(Object)
        );
      });
    });
  });

  describe('stale state', () => {
    it('provides isStale flag', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDiscovery),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(
        () => useServiceDiscovery('https://example.com/discovery'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      // isStale should be false immediately after fetch
      expect(typeof result.current.isStale).toBe('boolean');
      expect(result.current.isStale).toBe(false);
    });
  });
});
