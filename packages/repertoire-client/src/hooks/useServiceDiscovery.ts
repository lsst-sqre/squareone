'use client';
import { useQuery } from '@tanstack/react-query';
import { createDiscoveryQuery } from '../query';
import { discoveryQueryOptions } from '../query-options';

/**
 * React hook for client-side service discovery data access.
 *
 * Fetches service discovery data from the Repertoire API and provides
 * a query helper for accessing services, applications, and datasets.
 * Uses TanStack Query for caching, automatic refetching, and state management.
 *
 * @param repertoireUrl - The URL of the Repertoire discovery endpoint
 * @returns Object containing discovery data, query helper, and fetch state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { query, isPending } = useServiceDiscovery('/repertoire/discovery');
 *
 *   if (isPending) return <Loading />;
 *
 *   return (
 *     <nav>
 *       {query?.hasApplication('portal') && (
 *         <a href={query.getPortalUrl()}>Portal</a>
 *       )}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useServiceDiscovery(repertoireUrl: string) {
  const { data, refetch, isStale, isPending, isError, error } = useQuery(
    discoveryQueryOptions(repertoireUrl)
  );

  return {
    discovery: data,
    query: data ? createDiscoveryQuery(data) : null,
    refetch,
    isStale,
    isPending,
    isError,
    error,
  };
}
