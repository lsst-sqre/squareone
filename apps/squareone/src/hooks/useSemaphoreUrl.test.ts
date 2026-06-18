import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

// Import after mocking.
import type { AppConfig } from '../lib/config/loader';
import { useSemaphoreUrl } from './useSemaphoreUrl';
import { useStaticConfig } from './useStaticConfig';

// Build a config object with only the fields the hook reads, cast to the full
// AppConfig shape.
function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    semaphoreUrl: 'https://data.example.org/semaphore',
    ...overrides,
  } as AppConfig;
}

describe('useSemaphoreUrl', () => {
  it('returns the semaphoreUrl from config', () => {
    vi.mocked(useStaticConfig).mockReturnValue(makeConfig());

    const { result } = renderHook(() => useSemaphoreUrl());

    expect(result.current).toBe('https://data.example.org/semaphore');
  });

  it('returns undefined when semaphoreUrl is not configured', () => {
    vi.mocked(useStaticConfig).mockReturnValue(
      makeConfig({ semaphoreUrl: undefined })
    );

    const { result } = renderHook(() => useSemaphoreUrl());

    expect(result.current).toBeUndefined();
  });
});
