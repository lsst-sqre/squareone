import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useUnreadOnlyFilter from './useUnreadOnlyFilter';

// Mock Next.js App Router navigation hooks
const mockPush = vi.fn();
const mockPathname = '/notifications';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('useUnreadOnlyFilter', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it('reads showUnreadOnly=false when the parameter is absent', () => {
    const { result } = renderHook(() => useUnreadOnlyFilter());

    expect(result.current.showUnreadOnly).toBe(false);
  });

  it('reads showUnreadOnly=true from unread=true', () => {
    mockSearchParams = new URLSearchParams({ unread: 'true' });

    const { result } = renderHook(() => useUnreadOnlyFilter());

    expect(result.current.showUnreadOnly).toBe(true);
  });

  it('treats any value other than "true" as false', () => {
    mockSearchParams = new URLSearchParams({ unread: 'false' });

    const { result } = renderHook(() => useUnreadOnlyFilter());

    expect(result.current.showUnreadOnly).toBe(false);
  });

  it('serializes unread=true into the URL without scrolling', () => {
    const { result } = renderHook(() => useUnreadOnlyFilter());

    act(() => {
      result.current.setShowUnreadOnly(true);
    });

    expect(mockPush).toHaveBeenCalledWith('/notifications?unread=true', {
      scroll: false,
    });
  });

  it('removes the parameter when set to false rather than writing unread=false', () => {
    mockSearchParams = new URLSearchParams({ unread: 'true' });

    const { result } = renderHook(() => useUnreadOnlyFilter());

    act(() => {
      result.current.setShowUnreadOnly(false);
    });

    expect(mockPush).toHaveBeenCalledWith('/notifications', { scroll: false });
  });

  it('preserves unrelated query parameters when toggling', () => {
    mockSearchParams = new URLSearchParams({ foo: 'bar' });

    const { result } = renderHook(() => useUnreadOnlyFilter());

    act(() => {
      result.current.setShowUnreadOnly(true);
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/notifications?foo=bar&unread=true',
      {
        scroll: false,
      }
    );
  });
});
