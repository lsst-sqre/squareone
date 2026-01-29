import { queryOptions } from '@tanstack/react-query';
import { fetchBroadcasts, getEmptyBroadcasts, type Logger } from './client';
import type { BroadcastsResponse } from './schemas';

export type BroadcastsQueryConfig = {
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  logger?: Logger;
};

const defaultConfig: Required<Omit<BroadcastsQueryConfig, 'logger'>> = {
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
    logger: log,
  } = {
    ...defaultConfig,
    ...config,
  };

  const defaultLog: Logger = {
    debug: (obj, msg) => console.log(msg, obj),
    warn: (obj, msg) => console.warn(msg, obj),
    error: (obj, msg) => console.error(msg, obj),
  };
  const logger = log ?? defaultLog;

  return queryOptions({
    queryKey: ['broadcasts', semaphoreUrl] as const,
    queryFn: async (): Promise<BroadcastsResponse> => {
      try {
        return await fetchBroadcasts(semaphoreUrl, { logger });
      } catch (error) {
        logger.error({ err: error }, 'Failed to fetch broadcasts');
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
