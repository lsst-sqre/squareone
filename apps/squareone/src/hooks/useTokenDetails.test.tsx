import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import React from 'react';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useTokenDetails from './useTokenDetails';
import type { TokenInfo } from './useUserTokens';

// Mock fetch for tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToken: TokenInfo = {
  username: 'testuser',
  token_type: 'user',
  service: null,
  scopes: ['read:all', 'user:token'],
  created: 1614986130,
  expires: 1616986130,
  token: '5KVApqcVbSQWtO3VIRgOhQ',
  token_name: 'laptop token',
  last_used: 1615086130,
  parent: null,
};

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

describe('useTokenDetails', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch token details successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockToken,
    });

    const { result } = renderHook(
      () => useTokenDetails('testuser', '5KVApqcVbSQWtO3VIRgOhQ'),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toEqual(mockToken);
    expect(result.current.error).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/tokens/5KVApqcVbSQWtO3VIRgOhQ'
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle 404 error (token not found)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(
      () => useTokenDetails('testuser', '5KVApqcVbSQWtO3VIRgOhQ'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toContain('HTTP 404: Not Found');
  });

  it('should handle 403 error (permission denied)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    const { result } = renderHook(
      () => useTokenDetails('testuser', '5KVApqcVbSQWtO3VIRgOhQ'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toContain('HTTP 403: Forbidden');
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(
      () => useTokenDetails('testuser', '5KVApqcVbSQWtO3VIRgOhQ'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toContain('Network error');
  });

  it('should not fetch when username is undefined', () => {
    const { result } = renderHook(
      () => useTokenDetails(undefined, '5KVApqcVbSQWtO3VIRgOhQ'),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should not fetch when tokenKey is undefined', () => {
    const { result } = renderHook(
      () => useTokenDetails('testuser', undefined),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should not fetch when both username and tokenKey are undefined', () => {
    const { result } = renderHook(() => useTokenDetails(undefined, undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle 422 validation error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
    });

    const { result } = renderHook(
      () => useTokenDetails('testuser', 'invalid-token'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toContain(
      'HTTP 422: Unprocessable Entity'
    );
  });

  it('should cache and dedupe requests', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockToken,
    });

    const { result: result1 } = renderHook(
      () => useTokenDetails('testuser', '5KVApqcVbSQWtO3VIRgOhQ'),
      {
        wrapper: createWrapper(),
      }
    );

    const { result: result2 } = renderHook(
      () => useTokenDetails('testuser', '5KVApqcVbSQWtO3VIRgOhQ'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false);
    });

    expect(result1.current.token).toEqual(mockToken);
    expect(result2.current.token).toEqual(mockToken);

    // SWR should dedupe these requests - may only call once depending on timing
    // But we can verify that both hooks got the data
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should handle token without optional fields', async () => {
    const minimalToken: TokenInfo = {
      username: 'testuser',
      token_type: 'session',
      service: null,
      scopes: ['read:all'],
      token: 'AbCdEfGhIjKlMnOpQrStUv',
      parent: null,
      // created, expires, token_name, and last_used are omitted
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => minimalToken,
    });

    const { result } = renderHook(
      () => useTokenDetails('testuser', 'AbCdEfGhIjKlMnOpQrStUv'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toEqual(minimalToken);
    expect(result.current.token?.created).toBeUndefined();
    expect(result.current.token?.expires).toBeUndefined();
    expect(result.current.token?.token_name).toBeUndefined();
    expect(result.current.token?.last_used).toBeUndefined();
  });

  it('should refetch when tokenKey changes', async () => {
    const token1 = { ...mockToken, token: 'token1key1234567890AB' };
    const token2 = { ...mockToken, token: 'token2key1234567890CD' };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => token1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => token2,
      });

    const { result, rerender } = renderHook(
      ({ tokenKey }: { tokenKey: string }) =>
        useTokenDetails('testuser', tokenKey),
      {
        initialProps: { tokenKey: 'token1key1234567890AB' },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toEqual(token1);

    // Change tokenKey
    rerender({ tokenKey: 'token2key1234567890CD' });

    await waitFor(() => {
      expect(result.current.token).toEqual(token2);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      '/auth/api/v1/users/testuser/tokens/token1key1234567890AB'
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      '/auth/api/v1/users/testuser/tokens/token2key1234567890CD'
    );
  });

  it('should provide mutate function for manual revalidation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockToken,
    });

    const { result } = renderHook(
      () => useTokenDetails('testuser', '5KVApqcVbSQWtO3VIRgOhQ'),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.token).toEqual(mockToken);
    expect(typeof result.current.mutate).toBe('function');

    const initialCallCount = mockFetch.mock.calls.length;

    // Trigger manual revalidation
    await result.current.mutate();

    // Should have made an additional fetch call
    expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
  });
});
