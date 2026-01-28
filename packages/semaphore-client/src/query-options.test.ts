import { describe, expect, it } from 'vitest';
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
});
