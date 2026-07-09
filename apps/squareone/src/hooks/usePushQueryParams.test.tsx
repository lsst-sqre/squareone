import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import usePushQueryParams from './usePushQueryParams';

// Mock Next.js App Router navigation hooks
const mockPush = vi.fn();
const mockPathname = '/example';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('usePushQueryParams', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it('sets a parameter while preserving existing unrelated parameters', () => {
    mockSearchParams = new URLSearchParams({ foo: 'bar' });

    const { result } = renderHook(() => usePushQueryParams());

    act(() => {
      result.current((params) => {
        params.set('unread', 'true');
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/example?foo=bar&unread=true');
  });

  it('deletes a parameter while preserving the others', () => {
    mockSearchParams = new URLSearchParams({ foo: 'bar', unread: 'true' });

    const { result } = renderHook(() => usePushQueryParams());

    act(() => {
      result.current((params) => {
        params.delete('unread');
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/example?foo=bar');
  });

  it('pushes the bare pathname when no parameters remain', () => {
    mockSearchParams = new URLSearchParams({ unread: 'true' });

    const { result } = renderHook(() => usePushQueryParams());

    act(() => {
      result.current((params) => {
        params.delete('unread');
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/example');
  });

  it('forwards the scroll option when provided', () => {
    const { result } = renderHook(() => usePushQueryParams());

    act(() => {
      result.current(
        (params) => {
          params.set('unread', 'true');
        },
        { scroll: false }
      );
    });

    expect(mockPush).toHaveBeenCalledWith('/example?unread=true', {
      scroll: false,
    });
  });

  it('pushes the bare pathname with the scroll option when no parameters remain', () => {
    mockSearchParams = new URLSearchParams({ unread: 'true' });

    const { result } = renderHook(() => usePushQueryParams());

    act(() => {
      result.current(
        (params) => {
          params.delete('unread');
        },
        { scroll: false }
      );
    });

    expect(mockPush).toHaveBeenCalledWith('/example', { scroll: false });
  });
});
