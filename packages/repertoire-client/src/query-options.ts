import { queryOptions } from '@tanstack/react-query';
import { fetchServiceDiscovery, getEmptyDiscovery } from './client';
import type { ServiceDiscovery } from './types';

export const discoveryQueryOptions = (repertoireUrl: string) =>
  queryOptions({
    queryKey: ['service-discovery', repertoireUrl] as const,
    queryFn: async (): Promise<ServiceDiscovery> => {
      const requestId = Math.random().toString(36).substring(7);
      const env = typeof window === 'undefined' ? 'server' : 'client';
      const timestamp = new Date().toISOString();
      console.log(
        `[Discovery:${requestId}] queryFn called (${env}) at ${timestamp} for:`,
        repertoireUrl
      );
      try {
        const result = await fetchServiceDiscovery(repertoireUrl, requestId);
        console.log(
          `[Discovery:${requestId}] Successfully fetched, applications:`,
          result.applications
        );
        return result;
      } catch (error) {
        console.error(`[Discovery:${requestId}] Failed to fetch:`, error);
        return getEmptyDiscovery();
      }
    },
    enabled: !!repertoireUrl,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
