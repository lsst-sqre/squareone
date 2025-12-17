// Client-side hook - placeholder
'use client';
import { useQuery } from '@tanstack/react-query';
import { createDiscoveryQuery } from '../query';
import { discoveryQueryOptions } from '../query-options';

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
