import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { clearBroadcastsCache } from './client';
import { broadcastsQueryOptions } from './query-options';

describe('broadcastsQueryOptions', () => {
  const url = 'https://example.com/semaphore';

  it('produces the correct query key', () => {
    const opts = broadcastsQueryOptions(url);
    expect(opts.queryKey).toEqual(['broadcasts', url]);
  });

  it('uses default config values', () => {
    const opts = broadcastsQueryOptions(url);
    expect(opts.staleTime).toBe(60_000);
    expect(opts.gcTime).toBe(600_000);
    expect(opts.refetchInterval).toBe(60_000);
    expect(opts.refetchOnWindowFocus).toBe(true);
    expect(opts.refetchOnReconnect).toBe(true);
  });

  it('allows overriding config values', () => {
    const opts = broadcastsQueryOptions(url, {
      staleTime: 30_000,
      refetchInterval: 120_000,
    });
    expect(opts.staleTime).toBe(30_000);
    expect(opts.refetchInterval).toBe(120_000);
    // Defaults still apply for non-overridden values
    expect(opts.gcTime).toBe(600_000);
  });

  it('is disabled when URL is empty', () => {
    const opts = broadcastsQueryOptions('');
    expect(opts.enabled).toBe(false);
  });

  it('queryFn returns empty array on error', async () => {
    // queryFn catches errors and returns empty broadcasts
    const opts = broadcastsQueryOptions('https://invalid.example.com/nope');
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const result = await opts.queryFn!({} as never);
    expect(result).toEqual([]);
  });

  describe('reportError wiring (DM-55599 archetype)', () => {
    afterEach(() => {
      clearBroadcastsCache();
      vi.restoreAllMocks();
    });

    /** Stub `fetch` with an OK response carrying the given JSON body. */
    function mockFetchJson(body: unknown) {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => body,
        }))
      );
    }

    /** Stub `fetch` with a non-OK HTTP response of the given status. */
    function mockFetchStatus(status: number) {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: false,
          status,
          statusText: 'Error',
          json: async () => ({}),
        }))
      );
    }

    it('invokes reportError on a ZodError (contract drift) and still falls back', async () => {
      // A malformed payload makes BroadcastsResponseSchema.parse throw a
      // ZodError — the exact DM-55599 scenario.
      mockFetchJson({ not: 'a broadcasts array' });
      const reportError = vi.fn();

      const opts = broadcastsQueryOptions('https://example.com/semaphore', {
        reportError,
        context: { site: 'broadcasts', package: 'semaphore-client' },
      });
      // biome-ignore lint/style/noNonNullAssertion: test assertion
      const result = await opts.queryFn!({} as never);

      // Graceful fallback preserved.
      expect(result).toEqual([]);
      // reportError fired with the ZodError and the site context.
      expect(reportError).toHaveBeenCalledTimes(1);
      const [err, context] = reportError.mock.calls[0];
      expect(err).toBeInstanceOf(ZodError);
      expect(context).toMatchObject({
        site: 'broadcasts',
        package: 'semaphore-client',
      });
    });

    it('stays quiet on an expected auth failure (401)', async () => {
      mockFetchStatus(401);
      const reportError = vi.fn();

      const opts = broadcastsQueryOptions('https://example.com/semaphore', {
        reportError,
        context: { site: 'broadcasts' },
      });
      // biome-ignore lint/style/noNonNullAssertion: test assertion
      const result = await opts.queryFn!({} as never);

      expect(result).toEqual([]);
      expect(reportError).not.toHaveBeenCalled();
    });
  });
});
