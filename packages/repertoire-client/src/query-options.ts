import { queryOptions } from '@tanstack/react-query';
import {
  fetchServiceDiscovery,
  getEmptyDiscovery,
  type Logger,
} from './client';
import type { ServiceDiscovery } from './types';

const defaultLogger: Logger = {
  debug: (obj, msg) => console.log(msg, obj),
  warn: (obj, msg) => console.warn(msg, obj),
  error: (obj, msg) => console.error(msg, obj),
};

export const discoveryQueryOptions = (
  repertoireUrl: string,
  options?: { logger?: Logger }
) => {
  const log = options?.logger ?? defaultLogger;

  return queryOptions({
    queryKey: ['service-discovery', repertoireUrl] as const,
    queryFn: async (): Promise<ServiceDiscovery> => {
      const requestId = Math.random().toString(36).substring(7);
      const env = typeof window === 'undefined' ? 'server' : 'client';
      log.debug({ requestId, env, repertoireUrl }, 'Discovery queryFn called');
      try {
        const result = await fetchServiceDiscovery(repertoireUrl, {
          requestId,
          logger: log,
        });
        log.debug(
          { requestId, applications: result.applications },
          'Successfully fetched discovery'
        );
        return result;
      } catch (error) {
        log.error({ requestId, err: error }, 'Failed to fetch discovery');
        return getEmptyDiscovery();
      }
    },
    enabled: !!repertoireUrl,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
