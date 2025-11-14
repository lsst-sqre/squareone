import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import type { TokenType } from './useTokenChangeHistory';

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
function parseDate(value: string | string[] | undefined): Date | undefined {
  if (!value || Array.isArray(value)) return undefined;
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
function parseTokenType(
  value: string | string[] | undefined
): TokenType | undefined {
  if (!value || Array.isArray(value)) return undefined;
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
function parseString(value: string | string[] | undefined): string | undefined {
  if (!value || Array.isArray(value)) return undefined;
  return value;
}

/**
 * A React hook for managing token history filter state via URL query parameters.
 *
 * Uses Next.js router for URL state management with shallow routing to avoid
 * full page reloads. Serializes dates as ISO strings and handles null/undefined values.
 *
 * @returns Object containing current filters and functions to update them
 */
export default function useTokenHistoryFilters(): UseTokenHistoryFiltersReturn {
  const router = useRouter();

  // Parse current filters from URL query parameters
  const filters = useMemo<TokenHistoryFilters>(() => {
    return {
      tokenType: parseTokenType(router.query.token_type),
      token: parseString(router.query.token),
      since: parseDate(router.query.since),
      until: parseDate(router.query.until),
      ipAddress: parseString(router.query.ip_address),
    };
  }, [router.query]);

  /**
   * Update a single filter value in the URL
   */
  const setFilter = useCallback(
    <K extends keyof TokenHistoryFilters>(
      key: K,
      value: TokenHistoryFilters[K]
    ) => {
      const query = { ...router.query };

      // Map filter key to URL parameter name
      const paramName =
        key === 'tokenType'
          ? 'token_type'
          : key === 'ipAddress'
            ? 'ip_address'
            : key;

      if (value === undefined || value === null) {
        // Remove parameter if value is undefined or null
        delete query[paramName];
      } else if (value instanceof Date) {
        // Serialize Date as ISO string
        query[paramName] = value.toISOString();
      } else {
        // Set as string
        query[paramName] = String(value);
      }

      router.push(
        {
          pathname: router.pathname,
          query,
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
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
    router.push(
      {
        pathname: router.pathname,
        query: {},
      },
      undefined,
      { shallow: true }
    );
  }, [router]);

  /**
   * Set IP address filter and reset all other filters
   * Helper for clicking IP addresses in history details
   */
  const setIpAddressFilter = useCallback(
    (ipAddress: string) => {
      router.push(
        {
          pathname: router.pathname,
          query: { ip_address: ipAddress },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    setIpAddressFilter,
  };
}
