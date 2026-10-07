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
 *   (`isPending` until the first document loads; `isFetching` whenever a
 *   fetch is in flight, including a `refetch` of a loaded document)
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
  const { data, refetch, isStale, isPending, isFetching, isError, error } =
    useQuery(discoveryQueryOptions(repertoireUrl));

  return {
    discovery: data,
    query: data ? createDiscoveryQuery(data) : null,
    refetch,
    isStale,
    isPending,
    /** Whether a fetch is in flight, including a refetch of loaded data. */
    isFetching,
    isError,
    error,
  };
}
