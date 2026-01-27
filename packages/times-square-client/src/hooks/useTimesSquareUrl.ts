'use client';

/**
 * Hook to get the Times Square API base URL from repertoire service discovery.
 */
import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';

import { DEFAULT_TIMES_SQUARE_URL } from '../client';

/**
 * Get the Times Square API base URL from repertoire service discovery.
 *
 * Falls back to '/times-square' if:
 * - repertoireUrl is not provided
 * - Service discovery is still loading
 * - Times Square is not found in service discovery
 *
 * @param repertoireUrl - URL to the repertoire service discovery endpoint
 * @returns Times Square API base URL
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const repertoireUrl = useRepertoireUrl(); // From AppConfig
 *   const timesSquareUrl = useTimesSquareUrl(repertoireUrl);
 *
 *   // Use timesSquareUrl with other hooks
 *   const { page } = useTimesSquarePage('summit-weather', { repertoireUrl });
 * }
 * ```
 */
export function useTimesSquareUrl(repertoireUrl: string | undefined): string {
  const { query, isPending } = useServiceDiscovery(repertoireUrl ?? '');

  // Return default if no repertoire URL or still loading
  if (!repertoireUrl || isPending || !query) {
    return DEFAULT_TIMES_SQUARE_URL;
  }

  // Get URL from service discovery, fallback to default
  return query.getTimesSquareUrl() ?? DEFAULT_TIMES_SQUARE_URL;
}
