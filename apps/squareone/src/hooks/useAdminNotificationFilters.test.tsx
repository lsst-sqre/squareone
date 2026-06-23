import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useAdminNotificationFilters from './useAdminNotificationFilters';

// Mock Next.js App Router navigation hooks
const mockPush = vi.fn();
const mockPathname = '/admin/notifications';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('useAdminNotificationFilters', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it('parses recipient, sender, and date filters from the URL', () => {
    mockSearchParams = new URLSearchParams({
      recipient: 'alice',
      sender: 'ops-runbook',
      since: '2026-06-01T00:00:00.000Z',
      until: '2026-06-30T23:59:59.000Z',
    });

    const { result } = renderHook(() => useAdminNotificationFilters());

    expect(result.current.filters.recipient).toBe('alice');
    expect(result.current.filters.sender).toBe('ops-runbook');
    expect(result.current.filters.since).toEqual(
      new Date('2026-06-01T00:00:00.000Z')
    );
    expect(result.current.filters.until).toEqual(
      new Date('2026-06-30T23:59:59.000Z')
    );
  });

  it('returns empty filters when there are no query parameters', () => {
    mockSearchParams = new URLSearchParams();

    const { result } = renderHook(() => useAdminNotificationFilters());

    expect(result.current.filters.recipient).toBeUndefined();
    expect(result.current.filters.sender).toBeUndefined();
    expect(result.current.filters.since).toBeUndefined();
    expect(result.current.filters.until).toBeUndefined();
  });

  it('serializes a recipient filter into the URL', () => {
    const { result } = renderHook(() => useAdminNotificationFilters());

    act(() => {
      result.current.setFilter('recipient', 'alice');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/admin/notifications?recipient=alice'
    );
  });

  it('serializes a sender filter into the URL', () => {
    const { result } = renderHook(() => useAdminNotificationFilters());

    act(() => {
      result.current.setFilter('sender', 'ops-runbook');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/admin/notifications?sender=ops-runbook'
    );
  });

  it('serializes a date filter as an ISO string', () => {
    const { result } = renderHook(() => useAdminNotificationFilters());
    const testDate = new Date('2026-06-01T00:00:00.000Z');

    act(() => {
      result.current.setFilter('since', testDate);
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/admin/notifications?since=2026-06-01T00%3A00%3A00.000Z'
    );
  });

  it('preserves existing filters when setting a new one (filters combine)', () => {
    mockSearchParams = new URLSearchParams({ recipient: 'alice' });

    const { result } = renderHook(() => useAdminNotificationFilters());

    act(() => {
      result.current.setFilter('sender', 'ops-runbook');
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/admin/notifications?recipient=alice&sender=ops-runbook'
    );
  });

  it('removes a filter when set to undefined', () => {
    mockSearchParams = new URLSearchParams({ recipient: 'alice' });

    const { result } = renderHook(() => useAdminNotificationFilters());

    act(() => {
      result.current.setFilter('recipient', undefined);
    });

    expect(mockPush).toHaveBeenCalledWith('/admin/notifications');
  });

  it('clears all filters', () => {
    mockSearchParams = new URLSearchParams({
      recipient: 'alice',
      sender: 'ops-runbook',
      since: '2026-06-01T00:00:00.000Z',
    });

    const { result } = renderHook(() => useAdminNotificationFilters());

    act(() => {
      result.current.clearAllFilters();
    });

    expect(mockPush).toHaveBeenCalledWith('/admin/notifications');
  });

  it('ignores invalid date strings in the URL', () => {
    mockSearchParams = new URLSearchParams({
      since: 'not-a-date',
      until: 'also-invalid',
    });

    const { result } = renderHook(() => useAdminNotificationFilters());

    expect(result.current.filters.since).toBeUndefined();
    expect(result.current.filters.until).toBeUndefined();
  });
});
