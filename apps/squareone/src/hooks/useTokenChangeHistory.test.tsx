import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import useTokenChangeHistory, {
  type TokenChangeHistoryEntry,
} from './useTokenChangeHistory';

// Mock fetch for tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEntries: TokenChangeHistoryEntry[] = [
  {
    token: '5KVApqcVbSQWtO3VIRgOhQ',
    username: 'testuser',
    token_type: 'user',
    token_name: 'laptop token',
    parent: null,
    scopes: ['read:all', 'user:token'],
    service: null,
    expires: 1616986130,
    actor: 'testuser',
    action: 'create',
    old_token_name: null,
    old_scopes: null,
    old_expires: null,
    ip_address: '192.168.1.1',
    event_time: 1614986130,
  },
  {
    token: '5KVApqcVbSQWtO3VIRgOhQ',
    username: 'testuser',
    token_type: 'user',
    token_name: 'renamed token',
    parent: null,
    scopes: ['read:all', 'user:token', 'exec:notebook'],
    service: null,
    expires: 1616986130,
    actor: 'testuser',
    action: 'edit',
    old_token_name: 'laptop token',
    old_scopes: ['read:all', 'user:token'],
    old_expires: null,
    ip_address: '192.168.1.1',
    event_time: 1614990000,
  },
  {
    token: '5KVApqcVbSQWtO3VIRgOhQ',
    username: 'testuser',
    token_type: 'user',
    token_name: 'renamed token',
    parent: null,
    scopes: ['read:all', 'user:token', 'exec:notebook'],
    service: null,
    expires: 1616986130,
    actor: 'testuser',
    action: 'revoke',
    old_token_name: null,
    old_scopes: null,
    old_expires: null,
    ip_address: '192.168.1.1',
    event_time: 1614995000,
  },
];

// SWR wrapper for testing
const createWrapper = () => {
  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

describe('useTokenChangeHistory', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch initial page successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntries,
      headers: new Headers({
        'X-Total-Count': '3',
      }),
    });

    const { result } = renderHook(
      () => useTokenChangeHistory('testuser', { tokenType: 'user' }),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.entries).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.entries).toEqual(mockEntries);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/auth/api/v1/users/testuser/token-change-history'
      )
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('token_type=user')
    );
  });

  it('should handle pagination with cursor', async () => {
    const firstPageEntries = [mockEntries[0]];
    const secondPageEntries = [mockEntries[1], mockEntries[2]];

    // First page with next cursor
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => firstPageEntries,
      headers: new Headers({
        'X-Total-Count': '3',
        Link: '</auth/api/v1/users/testuser/token-change-history?cursor=p1_1614990000>; rel="next"',
      }),
    });

    const { result } = renderHook(
      () => useTokenChangeHistory('testuser', { tokenType: 'user' }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.entries).toEqual(firstPageEntries);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);

    // Load more - second page
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => secondPageEntries,
      headers: new Headers({
        'X-Total-Count': '3',
      }),
    });

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.entries?.length).toBe(3);
    });

    // Should accumulate entries
    expect(result.current.entries).toEqual([
      ...firstPageEntries,
      ...secondPageEntries,
    ]);
    expect(result.current.hasMore).toBe(false);
  });

  it('should parse Link header correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockEntries[0]],
      headers: new Headers({
        Link: '</auth/api/v1/users/testuser/token-change-history?cursor=p2_1614995000>; rel="next", </auth/api/v1/users/testuser/token-change-history?cursor=p0_1614986130>; rel="prev"',
      }),
    });

    const { result } = renderHook(() => useTokenChangeHistory('testuser'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasMore).toBe(true);
  });

  it('should handle fetch errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    const { result } = renderHook(() => useTokenChangeHistory('testuser'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.entries).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('HTTP 403: Forbidden');
  });

  it('should not fetch when username is undefined', () => {
    const { result } = renderHook(() => useTokenChangeHistory(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.entries).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTokenChangeHistory('testuser'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.entries).toBeUndefined();
    expect(result.current.error).toBeDefined();
  });

  it('should apply token filter (maps to API key parameter)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntries,
      headers: new Headers(),
    });

    renderHook(
      () =>
        useTokenChangeHistory('testuser', {
          token: '5KVApqcVbSQWtO3VIRgOhQ',
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('key=5KVApqcVbSQWtO3VIRgOhQ')
      );
    });
  });

  it('should apply date filters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntries,
      headers: new Headers(),
    });

    const since = new Date('2025-01-01T00:00:00Z');
    const until = new Date('2025-12-31T23:59:59Z');

    renderHook(
      () =>
        useTokenChangeHistory('testuser', {
          since,
          until,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('since=2025-01-01T00%3A00%3A00.000Z')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('until=2025-12-31T23%3A59%3A59.000Z')
      );
    });
  });

  it('should apply IP address filter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntries,
      headers: new Headers(),
    });

    renderHook(
      () =>
        useTokenChangeHistory('testuser', {
          ipAddress: '192.168.1.1',
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('ip_address=192.168.1.1')
      );
    });
  });

  it('should apply limit parameter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntries,
      headers: new Headers(),
    });

    renderHook(
      () =>
        useTokenChangeHistory('testuser', {
          limit: 25,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=25')
      );
    });
  });

  it('should normalize entries with missing optional fields', async () => {
    const entriesWithMissingFields = [
      {
        token: '5KVApqcVbSQWtO3VIRgOhQ',
        username: 'testuser',
        token_type: 'user',
        // token_name omitted
        // parent omitted
        scopes: ['read:all'],
        // service omitted
        // expires omitted
        actor: 'testuser',
        action: 'create',
        // old_token_name omitted
        // old_scopes omitted
        // old_expires omitted
        // ip_address omitted
        event_time: 1614986130,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => entriesWithMissingFields,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useTokenChangeHistory('testuser'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.entries).toBeDefined();
    expect(result.current.entries![0].token_name).toBe(null);
    expect(result.current.entries![0].parent).toBe(null);
    expect(result.current.entries![0].service).toBe(null);
    expect(result.current.entries![0].expires).toBe(null);
    expect(result.current.entries![0].old_token_name).toBe(null);
    expect(result.current.entries![0].old_scopes).toBe(null);
    expect(result.current.entries![0].old_expires).toBe(null);
    expect(result.current.entries![0].ip_address).toBe(null);
  });

  it('should reset entries when filters change', async () => {
    const firstFilterEntries = [mockEntries[0]];
    const secondFilterEntries = [mockEntries[1], mockEntries[2]];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => firstFilterEntries,
      headers: new Headers(),
    });

    const { result, rerender } = renderHook(
      ({ token }: { token?: string }) =>
        useTokenChangeHistory('testuser', { token }),
      {
        initialProps: { token: '5KVApqcVbSQWtO3VIRgOhQ' },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.entries).toEqual(firstFilterEntries);

    // Change filter
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => secondFilterEntries,
      headers: new Headers(),
    });

    rerender({ token: 'DGO1OnPohl0r3C7wqhzRgQ' });

    await waitFor(() => {
      // Wait for entries to match the new filter data
      expect(result.current.entries).toEqual(secondFilterEntries);
    });

    // Should replace entries, not accumulate
    expect(result.current.entries).toEqual(secondFilterEntries);
  });

  it('should handle array of token types (uses first type)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntries,
      headers: new Headers(),
    });

    renderHook(
      () =>
        useTokenChangeHistory('testuser', {
          tokenType: ['user', 'session'],
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('token_type=user')
      );
    });
  });

  it('should not refetch first page when loading more', async () => {
    const firstPageEntries = [mockEntries[0]];
    const secondPageEntries = [mockEntries[1]];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => firstPageEntries,
      headers: new Headers({
        Link: '</auth/api/v1/users/testuser/token-change-history?cursor=p1_1614990000>; rel="next"',
      }),
    });

    const { result } = renderHook(() => useTokenChangeHistory('testuser'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstPageCallCount = mockFetch.mock.calls.length;

    // Load second page
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => secondPageEntries,
      headers: new Headers(),
    });

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.entries?.length).toBe(2);
    });

    // Should only have made one additional call (for page 2)
    expect(mockFetch.mock.calls.length).toBe(firstPageCallCount + 1);
  });
});
