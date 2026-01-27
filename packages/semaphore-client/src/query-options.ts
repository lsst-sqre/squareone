import { queryOptions } from '@tanstack/react-query';
import { fetchBroadcasts, getEmptyBroadcasts } from './client';
import type { BroadcastsResponse } from './schemas';

export type BroadcastsQueryConfig = {
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
};

const defaultConfig: Required<BroadcastsQueryConfig> = {
  staleTime: 60 * 1000, // 60s
  gcTime: 10 * 60 * 1000, // 10 min
  refetchInterval: 60 * 1000, // 60s polling
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

export const broadcastsQueryOptions = (
  semaphoreUrl: string,
  config?: BroadcastsQueryConfig
) => {
  const {
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnReconnect,
  } = {
    ...defaultConfig,
    ...config,
  };

  return queryOptions({
    queryKey: ['broadcasts', semaphoreUrl] as const,
    queryFn: async (): Promise<BroadcastsResponse> => {
      try {
        return await fetchBroadcasts(semaphoreUrl);
      } catch (error) {
        console.error('[Semaphore] Failed to fetch broadcasts:', error);
        return getEmptyBroadcasts();
      }
    },
    enabled: !!semaphoreUrl,
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnReconnect,
  });
};
