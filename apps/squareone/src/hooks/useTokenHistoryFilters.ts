import type { TokenType } from '@lsst-sqre/gafaelfawr-client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type TokenHistoryFilters = {
  tokenType?: TokenType;
  token?: string; // Token key for filtering
  since?: Date;
  until?: Date;
  ipAddress?: string;
};

type UseTokenHistoryFiltersReturn = {
  filters: TokenHistoryFilters;
  setFilter: <K extends keyof TokenHistoryFilters>(
    key: K,
    value: TokenHistoryFilters[K]
  ) => void;
  clearFilter: (key: keyof TokenHistoryFilters) => void;
  clearAllFilters: () => void;
  setIpAddressFilter: (ipAddress: string) => void;
};

/**
 * Parse date from ISO string in URL parameter
 */
function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  try {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

/**
 * Parse token type from URL parameter
 */
function parseTokenType(value: string | null): TokenType | undefined {
  if (!value) return undefined;
  const validTypes: TokenType[] = [
    'session',
    'user',
    'notebook',
    'internal',
    'service',
    'oidc',
  ];
  return validTypes.includes(value as TokenType)
    ? (value as TokenType)
    : undefined;
}

/**
 * Parse string from URL parameter
 */
function parseString(value: string | null): string | undefined {
  if (!value) return undefined;
  return value;
}

/**
 * A React hook for managing token history filter state via URL query parameters.
 *
 * Uses Next.js App Router navigation hooks for URL state management.
 * Serializes dates as ISO strings and handles null/undefined values.
 *
 * @returns Object containing current filters and functions to update them
 */
export default function useTokenHistoryFilters(): UseTokenHistoryFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current filters from URL search params
  const filters = useMemo<TokenHistoryFilters>(() => {
    return {
      tokenType: parseTokenType(searchParams.get('token_type')),
      token: parseString(searchParams.get('token')),
      since: parseDate(searchParams.get('since')),
      until: parseDate(searchParams.get('until')),
      ipAddress: parseString(searchParams.get('ip_address')),
    };
  }, [searchParams]);

  /**
   * Update a single filter value in the URL
   */
  const setFilter = useCallback(
    <K extends keyof TokenHistoryFilters>(
      key: K,
      value: TokenHistoryFilters[K]
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      // Map filter key to URL parameter name
      const paramName =
        key === 'tokenType'
          ? 'token_type'
          : key === 'ipAddress'
            ? 'ip_address'
            : key;

      if (value === undefined || value === null) {
        // Remove parameter if value is undefined or null
        params.delete(paramName);
      } else if (value instanceof Date) {
        // Serialize Date as ISO string
        params.set(paramName, value.toISOString());
      } else {
        // Set as string
        params.set(paramName, String(value));
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname, searchParams]
  );

  /**
   * Clear a single filter from the URL
   */
  const clearFilter = useCallback(
    (key: keyof TokenHistoryFilters) => {
      setFilter(key, undefined);
    },
    [setFilter]
  );

  /**
   * Clear all filters from the URL
   */
  const clearAllFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  /**
   * Set IP address filter and reset all other filters
   * Helper for clicking IP addresses in history details
   */
  const setIpAddressFilter = useCallback(
    (ipAddress: string) => {
      router.push(`${pathname}?ip_address=${encodeURIComponent(ipAddress)}`);
    },
    [router, pathname]
  );

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    setIpAddressFilter,
  };
}
