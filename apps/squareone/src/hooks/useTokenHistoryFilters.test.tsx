import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useTokenHistoryFilters from './useTokenHistoryFilters';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('useTokenHistoryFilters', () => {
  let mockPush: ReturnType<typeof vi.fn>;
  let mockRouter: any;

  beforeEach(() => {
    mockPush = vi.fn();
    mockRouter = {
      pathname: '/settings/tokens/history',
      query: {},
      push: mockPush,
    };
    vi.mocked(useRouter).mockReturnValue(mockRouter);
  });

  it('should parse filters from URL query parameters', () => {
    mockRouter.query = {
      token_type: 'user',
      token: '5KVApqcVbSQWtO3VIRgOhQ',
      since: '2025-01-01T00:00:00.000Z',
      until: '2025-12-31T23:59:59.000Z',
      ip_address: '192.168.1.1',
    };

    const { result } = renderHook(() => useTokenHistoryFilters());

    expect(result.current.filters.tokenType).toBe('user');
    expect(result.current.filters.token).toBe('5KVApqcVbSQWtO3VIRgOhQ');
    expect(result.current.filters.since).toEqual(
      new Date('2025-01-01T00:00:00.000Z')
    );
    expect(result.current.filters.until).toEqual(
      new Date('2025-12-31T23:59:59.000Z')
    );
    expect(result.current.filters.ipAddress).toBe('192.168.1.1');
  });

  it('should return empty filters when no query parameters', () => {
    mockRouter.query = {};

    const { result } = renderHook(() => useTokenHistoryFilters());

    expect(result.current.filters.tokenType).toBeUndefined();
    expect(result.current.filters.token).toBeUndefined();
    expect(result.current.filters.since).toBeUndefined();
    expect(result.current.filters.until).toBeUndefined();
    expect(result.current.filters.ipAddress).toBeUndefined();
  });

  it('should set a string filter', () => {
    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('token', '5KVApqcVbSQWtO3VIRgOhQ');
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: { token: '5KVApqcVbSQWtO3VIRgOhQ' },
      },
      undefined,
      { shallow: true }
    );
  });

  it('should set a token type filter', () => {
    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('tokenType', 'user');
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: { token_type: 'user' },
      },
      undefined,
      { shallow: true }
    );
  });

  it('should set a date filter', () => {
    const { result } = renderHook(() => useTokenHistoryFilters());
    const testDate = new Date('2025-01-01T00:00:00.000Z');

    act(() => {
      result.current.setFilter('since', testDate);
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: { since: '2025-01-01T00:00:00.000Z' },
      },
      undefined,
      { shallow: true }
    );
  });

  it('should set an IP address filter', () => {
    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('ipAddress', '192.168.1.1');
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: { ip_address: '192.168.1.1' },
      },
      undefined,
      { shallow: true }
    );
  });

  it('should preserve existing filters when setting a new one', () => {
    mockRouter.query = { token: '5KVApqcVbSQWtO3VIRgOhQ' };

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('tokenType', 'user');
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: {
          token: '5KVApqcVbSQWtO3VIRgOhQ',
          token_type: 'user',
        },
      },
      undefined,
      { shallow: true }
    );
  });

  it('should clear a single filter', () => {
    mockRouter.query = {
      token: '5KVApqcVbSQWtO3VIRgOhQ',
      token_type: 'user',
    };

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.clearFilter('token');
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: { token_type: 'user' },
      },
      undefined,
      { shallow: true }
    );
  });

  it('should clear all filters', () => {
    mockRouter.query = {
      token: '5KVApqcVbSQWtO3VIRgOhQ',
      token_type: 'user',
      since: '2025-01-01T00:00:00.000Z',
    };

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.clearAllFilters();
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: {},
      },
      undefined,
      { shallow: true }
    );
  });

  it('should set IP address filter and reset all other filters', () => {
    mockRouter.query = {
      token: '5KVApqcVbSQWtO3VIRgOhQ',
      token_type: 'user',
    };

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setIpAddressFilter('192.168.1.1');
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: { ip_address: '192.168.1.1' },
      },
      undefined,
      { shallow: true }
    );
  });

  it('should handle invalid date strings', () => {
    mockRouter.query = {
      since: 'invalid-date',
      until: 'also-invalid',
    };

    const { result } = renderHook(() => useTokenHistoryFilters());

    expect(result.current.filters.since).toBeUndefined();
    expect(result.current.filters.until).toBeUndefined();
  });

  it('should handle invalid token types', () => {
    mockRouter.query = {
      token_type: 'invalid_type',
    };

    const { result } = renderHook(() => useTokenHistoryFilters());

    expect(result.current.filters.tokenType).toBeUndefined();
  });

  it('should handle array query parameters by ignoring them', () => {
    mockRouter.query = {
      token: ['value1', 'value2'],
      token_type: ['user', 'session'],
    };

    const { result } = renderHook(() => useTokenHistoryFilters());

    expect(result.current.filters.token).toBeUndefined();
    expect(result.current.filters.tokenType).toBeUndefined();
  });

  it('should remove filter when setting to undefined', () => {
    mockRouter.query = {
      token: '5KVApqcVbSQWtO3VIRgOhQ',
    };

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('token', undefined);
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: {},
      },
      undefined,
      { shallow: true }
    );
  });

  it('should remove filter when setting to null', () => {
    mockRouter.query = {
      token: '5KVApqcVbSQWtO3VIRgOhQ',
    };

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('token', null as any);
    });

    expect(mockPush).toHaveBeenCalledWith(
      {
        pathname: '/settings/tokens/history',
        query: {},
      },
      undefined,
      { shallow: true }
    );
  });

  it('should use shallow routing for all operations', () => {
    const { result } = renderHook(() => useTokenHistoryFilters());

    // Test setFilter
    act(() => {
      result.current.setFilter('token', 'test');
    });
    expect(mockPush).toHaveBeenLastCalledWith(expect.anything(), undefined, {
      shallow: true,
    });

    // Test clearAllFilters
    act(() => {
      result.current.clearAllFilters();
    });
    expect(mockPush).toHaveBeenLastCalledWith(expect.anything(), undefined, {
      shallow: true,
    });

    // Test setIpAddressFilter
    act(() => {
      result.current.setIpAddressFilter('192.168.1.1');
    });
    expect(mockPush).toHaveBeenLastCalledWith(expect.anything(), undefined, {
      shallow: true,
    });
  });

  it('should parse all valid token types', () => {
    const validTypes = [
      'session',
      'user',
      'notebook',
      'internal',
      'service',
      'oidc',
    ];

    validTypes.forEach((type) => {
      mockRouter.query = { token_type: type };
      const { result } = renderHook(() => useTokenHistoryFilters());
      expect(result.current.filters.tokenType).toBe(type);
    });
  });
});
