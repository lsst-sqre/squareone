'use client';
import { useQuery } from '@tanstack/react-query';
import {
  type BroadcastsQueryConfig,
  broadcastsQueryOptions,
} from '../query-options';

/**
 * React hook for fetching broadcast messages from Semaphore.
 *
 * Uses TanStack Query for caching, automatic polling (60s default),
 * and state management.
 *
 * @param semaphoreUrl - The base URL of the Semaphore service
 * @param config - Optional query configuration overrides
 */
export function useBroadcasts(
  semaphoreUrl: string,
  config?: BroadcastsQueryConfig
) {
  const { data, refetch, isPending, isError, error } = useQuery(
    broadcastsQueryOptions(semaphoreUrl, config)
  );

  return {
    broadcasts: data ?? [],
    refetch,
    isPending,
    isError,
    error,
  };
}
