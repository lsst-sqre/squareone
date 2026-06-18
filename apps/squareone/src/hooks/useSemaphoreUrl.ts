'use client';

import { useStaticConfig } from './useStaticConfig';

/**
 * Hook to get the Semaphore service URL from configuration.
 *
 * Works in both App Router and Pages Router contexts by leveraging
 * the unified useStaticConfig hook.
 *
 * @returns The Semaphore URL if configured, undefined otherwise.
 */
export function useSemaphoreUrl(): string | undefined {
  const config = useStaticConfig();
  return config.semaphoreUrl;
}
