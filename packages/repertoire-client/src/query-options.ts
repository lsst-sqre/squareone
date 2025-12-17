// TanStack Query options factory - placeholder
import { queryOptions } from '@tanstack/react-query';
import { fetchServiceDiscovery, getEmptyDiscovery } from './client';
import type { ServiceDiscovery } from './types';

export const discoveryQueryOptions = (repertoireUrl: string) =>
  queryOptions({
    queryKey: ['service-discovery', repertoireUrl] as const,
    queryFn: async (): Promise<ServiceDiscovery> => {
      try {
        return await fetchServiceDiscovery(repertoireUrl);
      } catch (error) {
        console.error('[Discovery] Failed to fetch:', error);
        return getEmptyDiscovery();
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
