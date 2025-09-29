import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import useUserTokens, {
  extractTokenNames,
  type TokenInfo,
} from './useUserTokens';

// Mock fetch for tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockTokens: TokenInfo[] = [
  {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['read:all', 'user:token'],
    created: 1614986130,
    expires: 1616986130,
    token: '5KVApqcVbSQWtO3VIRgOhQ',
    token_name: 'laptop token',
    last_used: 1615072530,
    parent: null,
  },
  {
    username: 'testuser',
    token_type: 'notebook',
    service: null,
    scopes: ['read:all'],
    created: 1614990000,
    expires: null,
    token: 'DGO1OnPohl0r3C7wqhzRgQ',
    token_name: 'notebook session',
    last_used: 1615000000,
    parent: '5KVApqcVbSQWtO3VIRgOhQ',
  },
  {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['read:all'],
    created: 1614995000,
    expires: null,
    token: 'XYZ123ABC456DEF789GHI0',
    token_name: null, // Test null token name
    last_used: null,
    parent: null,
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

describe('useUserTokens', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tokens successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokens,
    });

    const { result } = renderHook(() => useUserTokens('testuser'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.tokens).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tokens).toEqual(mockTokens);
    expect(result.current.error).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/tokens'
    );
    expect(typeof result.current.mutate).toBe('function');
  });

  it('should handle fetch errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    const { result } = renderHook(() => useUserTokens('testuser'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tokens).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toContain('HTTP 403: Forbidden');
  });

  it('should not fetch when username is undefined', () => {
    const { result } = renderHook(() => useUserTokens(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.tokens).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUserTokens('testuser'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tokens).toBeUndefined();
    expect(result.current.error).toBeDefined();
  });
});

describe('extractTokenNames', () => {
  it('should extract non-null token names', () => {
    const names = extractTokenNames(mockTokens);
    expect(names).toEqual(['laptop token', 'notebook session']);
  });

  it('should return empty array for undefined tokens', () => {
    const names = extractTokenNames(undefined);
    expect(names).toEqual([]);
  });

  it('should return empty array for empty tokens array', () => {
    const names = extractTokenNames([]);
    expect(names).toEqual([]);
  });

  it('should filter out null token names', () => {
    const tokensWithNulls: TokenInfo[] = [
      {
        username: 'testuser',
        token_type: 'user',
        service: null,
        scopes: ['read:all'],
        token: 'ABC123',
        token_name: 'valid name',
        expires: null,
        last_used: null,
        parent: null,
      },
      {
        username: 'testuser',
        token_type: 'user',
        service: null,
        scopes: ['read:all'],
        token: 'DEF456',
        token_name: null,
        expires: null,
        last_used: null,
        parent: null,
      },
    ];

    const names = extractTokenNames(tokensWithNulls);
    expect(names).toEqual(['valid name']);
  });
});
