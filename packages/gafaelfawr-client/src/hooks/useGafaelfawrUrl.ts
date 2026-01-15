'use client';

/**
 * Hook to get the Gafaelfawr API base URL from repertoire service discovery.
 */
import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';

import { DEFAULT_GAFAELFAWR_URL } from '../client';

/**
 * Get the Gafaelfawr API base URL from repertoire service discovery.
 *
 * Falls back to '/auth/api/v1' if:
 * - repertoireUrl is not provided
 * - Service discovery is still loading
 * - Gafaelfawr is not found in service discovery
 *
 * @param repertoireUrl - URL to the repertoire service discovery endpoint
 * @returns Gafaelfawr API base URL
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const repertoireUrl = useRepertoireUrl(); // From AppConfig
 *   const gafaelfawrUrl = useGafaelfawrUrl(repertoireUrl);
 *
 *   // Use gafaelfawrUrl with other hooks
 *   const { userInfo } = useUserInfo(gafaelfawrUrl);
 * }
 * ```
 */
export function useGafaelfawrUrl(repertoireUrl: string | undefined): string {
  const { query, isPending } = useServiceDiscovery(repertoireUrl ?? '');

  // Return default if no repertoire URL or still loading
  if (!repertoireUrl || isPending || !query) {
    return DEFAULT_GAFAELFAWR_URL;
  }

  // Get URL from service discovery, fallback to default
  return query.getGafaelfawrUrl() ?? DEFAULT_GAFAELFAWR_URL;
}
