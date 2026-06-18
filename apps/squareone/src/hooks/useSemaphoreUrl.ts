'use client';

import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import { useRepertoireUrl } from './useRepertoireUrl';

/**
 * Hook to get the Semaphore service URL from Repertoire service discovery.
 *
 * Resolves the Repertoire discovery URL from config and asks service discovery
 * for the Semaphore base URL, mirroring how `BroadcastBannerStack` and the RSC
 * layout discover Semaphore. The static `semaphoreUrl` config field is
 * deprecated in favour of discovery.
 *
 * @returns The Semaphore URL once discovered, or `undefined` while discovery is
 * pending or when Repertoire/Semaphore is undiscovered. Returning `undefined`
 * keeps dependent queries (broadcasts, admin notifications) disabled — the same
 * graceful degradation broadcasts already rely on.
 */
export function useSemaphoreUrl(): string | undefined {
  const repertoireUrl = useRepertoireUrl();
  const { query } = useServiceDiscovery(repertoireUrl ?? '');
  return query?.getSemaphoreUrl();
}
