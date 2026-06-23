import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(),
}));

vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  useServiceDiscovery: vi.fn(),
}));

// Import after mocking.
import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import { useRepertoireUrl } from './useRepertoireUrl';
import { useSemaphoreUrl, useSemaphoreUrlState } from './useSemaphoreUrl';

// Build a fake useServiceDiscovery return that exposes only the query method the
// hook calls, cast to the full hook return shape.
function makeDiscoveryReturn(
  getSemaphoreUrl: () => string | undefined
): ReturnType<typeof useServiceDiscovery> {
  return {
    discovery: {},
    query: { getSemaphoreUrl },
    refetch: vi.fn(),
    isStale: false,
    isPending: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useServiceDiscovery>;
}

// A pending/disabled discovery query (no data yet) exposes a null query.
function makePendingDiscoveryReturn(): ReturnType<typeof useServiceDiscovery> {
  return {
    discovery: undefined,
    query: null,
    refetch: vi.fn(),
    isStale: false,
    isPending: true,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useServiceDiscovery>;
}

// A settled-but-errored discovery query: no data, but the request finished with
// an error, so discovery is no longer resolving.
function makeErroredDiscoveryReturn(): ReturnType<typeof useServiceDiscovery> {
  return {
    discovery: undefined,
    query: null,
    refetch: vi.fn(),
    isStale: false,
    isPending: false,
    isError: true,
    error: new Error('discovery failed'),
  } as unknown as ReturnType<typeof useServiceDiscovery>;
}

describe('useSemaphoreUrl', () => {
  it('returns the Semaphore URL from service discovery', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(
      'https://data.example.org/repertoire'
    );
    vi.mocked(useServiceDiscovery).mockReturnValue(
      makeDiscoveryReturn(() => 'https://data.example.org/semaphore')
    );

    const { result } = renderHook(() => useSemaphoreUrl());

    expect(result.current).toBe('https://data.example.org/semaphore');
  });

  it('discovers services from the Repertoire URL', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(
      'https://data.example.org/repertoire'
    );
    vi.mocked(useServiceDiscovery).mockReturnValue(
      makeDiscoveryReturn(() => 'https://data.example.org/semaphore')
    );

    renderHook(() => useSemaphoreUrl());

    expect(useServiceDiscovery).toHaveBeenCalledWith(
      'https://data.example.org/repertoire'
    );
  });

  it('passes an empty string to discovery when Repertoire is undefined', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    vi.mocked(useServiceDiscovery).mockReturnValue(
      makePendingDiscoveryReturn()
    );

    renderHook(() => useSemaphoreUrl());

    expect(useServiceDiscovery).toHaveBeenCalledWith('');
  });

  it('returns undefined while discovery is pending', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    vi.mocked(useServiceDiscovery).mockReturnValue(
      makePendingDiscoveryReturn()
    );

    const { result } = renderHook(() => useSemaphoreUrl());

    expect(result.current).toBeUndefined();
  });

  it('returns undefined when Semaphore is undiscovered', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(
      'https://data.example.org/repertoire'
    );
    vi.mocked(useServiceDiscovery).mockReturnValue(
      makeDiscoveryReturn(() => undefined)
    );

    const { result } = renderHook(() => useSemaphoreUrl());

    expect(result.current).toBeUndefined();
  });
});

describe('useSemaphoreUrlState', () => {
  it('reports resolving while discovery is still pending', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    vi.mocked(useServiceDiscovery).mockReturnValue(
      makePendingDiscoveryReturn()
    );

    const { result } = renderHook(() => useSemaphoreUrlState());

    expect(result.current).toEqual({
      url: undefined,
      isResolving: true,
      isUnavailable: false,
    });
  });

  it('reports unavailable once discovery settles without a Semaphore URL', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(
      'https://data.example.org/repertoire'
    );
    vi.mocked(useServiceDiscovery).mockReturnValue(
      makeDiscoveryReturn(() => undefined)
    );

    const { result } = renderHook(() => useSemaphoreUrlState());

    expect(result.current).toEqual({
      url: undefined,
      isResolving: false,
      isUnavailable: true,
    });
  });

  it('reports unavailable when discovery settles with an error', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(
      'https://data.example.org/repertoire'
    );
    vi.mocked(useServiceDiscovery).mockReturnValue(
      makeErroredDiscoveryReturn()
    );

    const { result } = renderHook(() => useSemaphoreUrlState());

    expect(result.current).toEqual({
      url: undefined,
      isResolving: false,
      isUnavailable: true,
    });
  });

  it('reports the resolved URL once Semaphore is discovered', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(
      'https://data.example.org/repertoire'
    );
    vi.mocked(useServiceDiscovery).mockReturnValue(
      makeDiscoveryReturn(() => 'https://data.example.org/semaphore')
    );

    const { result } = renderHook(() => useSemaphoreUrlState());

    expect(result.current).toEqual({
      url: 'https://data.example.org/semaphore',
      isResolving: false,
      isUnavailable: false,
    });
  });
});
