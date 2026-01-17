import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useTokenHistoryFilters from './useTokenHistoryFilters';

// Mock Next.js App Router navigation hooks
const mockPush = vi.fn();
const mockPathname = '/settings/tokens/history';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('useTokenHistoryFilters', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it('should parse filters from URL query parameters', () => {
    mockSearchParams = new URLSearchParams({
      token_type: 'user',
      token: '5KVApqcVbSQWtO3VIRgOhQ',
      since: '2025-01-01T00:00:00.000Z',
      until: '2025-12-31T23:59:59.000Z',
      ip_address: '192.168.1.1',
    });

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
    mockSearchParams = new URLSearchParams();

    const { result } = renderHook(() => useTokenHistoryFilters());

    expect(result.current.filters.tokenType).toBeUndefined();
    expect(result.current.filters.token).toBeUndefined();
    expect(result.current.filters.since).toBeUndefined();
    expect(result.current.filters.until).toBeUndefined();
    expect(result.current.filters.ipAddress).toBeUndefined();
  });

  it('should set a string filter', () => {
    mockSearchParams = new URLSearchParams();

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('token', '5KVApqcVbSQWtO3VIRgOhQ');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/settings/tokens/history?token=5KVApqcVbSQWtO3VIRgOhQ'
    );
  });

  it('should set a token type filter', () => {
    mockSearchParams = new URLSearchParams();

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('tokenType', 'user');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/settings/tokens/history?token_type=user'
    );
  });

  it('should set a date filter', () => {
    mockSearchParams = new URLSearchParams();

    const { result } = renderHook(() => useTokenHistoryFilters());
    const testDate = new Date('2025-01-01T00:00:00.000Z');

    act(() => {
      result.current.setFilter('since', testDate);
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/settings/tokens/history?since=2025-01-01T00%3A00%3A00.000Z'
    );
  });

  it('should set an IP address filter', () => {
    mockSearchParams = new URLSearchParams();

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('ipAddress', '192.168.1.1');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/settings/tokens/history?ip_address=192.168.1.1'
    );
  });

  it('should preserve existing filters when setting a new one', () => {
    mockSearchParams = new URLSearchParams({
      token: '5KVApqcVbSQWtO3VIRgOhQ',
    });

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('tokenType', 'user');
    });

    // URLSearchParams preserves order, so token comes first
    expect(mockPush).toHaveBeenCalledWith(
      '/settings/tokens/history?token=5KVApqcVbSQWtO3VIRgOhQ&token_type=user'
    );
  });

  it('should clear a single filter', () => {
    mockSearchParams = new URLSearchParams({
      token: '5KVApqcVbSQWtO3VIRgOhQ',
      token_type: 'user',
    });

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.clearFilter('token');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/settings/tokens/history?token_type=user'
    );
  });

  it('should clear all filters', () => {
    mockSearchParams = new URLSearchParams({
      token: '5KVApqcVbSQWtO3VIRgOhQ',
      token_type: 'user',
      since: '2025-01-01T00:00:00.000Z',
    });

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.clearAllFilters();
    });

    expect(mockPush).toHaveBeenCalledWith('/settings/tokens/history');
  });

  it('should set IP address filter and reset all other filters', () => {
    mockSearchParams = new URLSearchParams({
      token: '5KVApqcVbSQWtO3VIRgOhQ',
      token_type: 'user',
    });

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setIpAddressFilter('192.168.1.1');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/settings/tokens/history?ip_address=192.168.1.1'
    );
  });

  it('should handle invalid date strings', () => {
    mockSearchParams = new URLSearchParams({
      since: 'invalid-date',
      until: 'also-invalid',
    });

    const { result } = renderHook(() => useTokenHistoryFilters());

    expect(result.current.filters.since).toBeUndefined();
    expect(result.current.filters.until).toBeUndefined();
  });

  it('should handle invalid token types', () => {
    mockSearchParams = new URLSearchParams({
      token_type: 'invalid_type',
    });

    const { result } = renderHook(() => useTokenHistoryFilters());

    expect(result.current.filters.tokenType).toBeUndefined();
  });

  it('should remove filter when setting to undefined', () => {
    mockSearchParams = new URLSearchParams({
      token: '5KVApqcVbSQWtO3VIRgOhQ',
    });

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      result.current.setFilter('token', undefined);
    });

    expect(mockPush).toHaveBeenCalledWith('/settings/tokens/history');
  });

  it('should remove filter when setting to null', () => {
    mockSearchParams = new URLSearchParams({
      token: '5KVApqcVbSQWtO3VIRgOhQ',
    });

    const { result } = renderHook(() => useTokenHistoryFilters());

    act(() => {
      // biome-ignore lint/suspicious/noExplicitAny: Test validates null handling with any cast
      result.current.setFilter('token', null as any);
    });

    expect(mockPush).toHaveBeenCalledWith('/settings/tokens/history');
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
      mockSearchParams = new URLSearchParams({ token_type: type });
      const { result } = renderHook(() => useTokenHistoryFilters());
      expect(result.current.filters.tokenType).toBe(type);
    });
  });
});
