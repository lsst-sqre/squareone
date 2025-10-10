import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';

export type TokenType =
  | 'session'
  | 'user'
  | 'notebook'
  | 'internal'
  | 'service'
  | 'oidc';
export type TokenChange = 'create' | 'revoke' | 'expire' | 'edit';

export type TokenChangeHistoryEntry = {
  token: string; // 22-char key
  username: string;
  token_type: TokenType;
  token_name: string | null;
  parent: string | null;
  scopes: string[];
  service: string | null;
  expires: number | null; // Seconds since epoch
  actor: string;
  action: TokenChange;
  old_token_name: string | null; // For edit actions
  old_scopes: string[] | null; // For edit actions
  old_expires: number | null; // For edit actions
  ip_address: string | null;
  event_time: number; // Seconds since epoch
};

type PaginatedResponse = {
  entries: TokenChangeHistoryEntry[];
  nextCursor: string | null;
  totalCount: number | null;
};

type UseTokenChangeHistoryOptions = {
  tokenType?: TokenType | TokenType[]; // Support single or multiple types
  token?: string; // Maps to API 'key' parameter
  since?: Date;
  until?: Date;
  ipAddress?: string;
  limit?: number;
};

type UseTokenChangeHistoryReturn = {
  entries: TokenChangeHistoryEntry[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  hasMore: boolean;
  totalCount: number | undefined;
  loadMore: () => void;
  isLoadingMore: boolean;
  mutate: () => Promise<PaginatedResponse[] | undefined>;
};

/**
 * Parse Link header for pagination according to RFC 5988
 * Returns the next cursor if available
 */
function parseLinkHeader(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  const links = linkHeader.split(',');
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    if (match) {
      const url = new URL(match[1], window.location.origin);
      return url.searchParams.get('cursor');
    }
  }
  return null;
}

/**
 * Normalize API response to ensure null values for optional fields
 * Gafaelfawr API may omit null/optional fields from JSON responses
 */
function normalizeEntry(entry: any): TokenChangeHistoryEntry {
  return {
    token: entry.token,
    username: entry.username,
    token_type: entry.token_type,
    token_name: entry.token_name ?? null,
    parent: entry.parent ?? null,
    scopes: entry.scopes ?? [],
    service: entry.service ?? null,
    expires: entry.expires ?? null,
    actor: entry.actor,
    action: entry.action,
    old_token_name: entry.old_token_name ?? null,
    old_scopes: entry.old_scopes ?? null,
    old_expires: entry.old_expires ?? null,
    ip_address: entry.ip_address ?? null,
    event_time: entry.event_time,
  };
}

const fetcher = async (url: string): Promise<PaginatedResponse> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Normalize entries to ensure null values for optional fields
  const entries = (Array.isArray(data) ? data : []).map(normalizeEntry);

  // Parse pagination headers
  const linkHeader = response.headers.get('Link');
  const nextCursor = parseLinkHeader(linkHeader);

  const totalCountHeader = response.headers.get('X-Total-Count');
  const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : null;

  return {
    entries,
    nextCursor,
    totalCount,
  };
};

/**
 * Build query string from filter options
 */
function buildQueryString(
  options: UseTokenChangeHistoryOptions,
  cursor?: string | null
): string {
  const params = new URLSearchParams();

  // Handle token_type parameter (API accepts single value)
  if (options.tokenType) {
    const tokenType = Array.isArray(options.tokenType)
      ? options.tokenType[0]
      : options.tokenType;
    params.append('token_type', tokenType);
  }

  // Map 'token' option to API 'key' parameter
  if (options.token) {
    params.append('key', options.token);
  }

  if (options.since) {
    params.append('since', options.since.toISOString());
  }

  if (options.until) {
    params.append('until', options.until.toISOString());
  }

  if (options.ipAddress) {
    params.append('ip_address', options.ipAddress);
  }

  if (options.limit) {
    params.append('limit', options.limit.toString());
  }

  if (cursor) {
    params.append('cursor', cursor);
  }

  return params.toString();
}

/**
 * A React hook for fetching token change history from the
 * `/auth/api/v1/users/{username}/token-change-history` endpoint.
 *
 * Uses SWR Infinite for data fetching and caching with cursor-based pagination.
 * Automatically accumulates entries across pages.
 *
 * @param username - The username to fetch token history for
 * @param options - Filter options (tokenType, token, since, until, ipAddress, limit)
 * @returns Object containing entries data, loading states, pagination state, and mutate function
 */
export default function useTokenChangeHistory(
  username: string | undefined,
  options: UseTokenChangeHistoryOptions = {}
): UseTokenChangeHistoryReturn {
  // Convert Date objects to timestamps for stable dependency tracking
  const sinceTime = options.since?.getTime();
  const untilTime = options.until?.getTime();

  // Memoize filter options with stable references
  const filterOptions = useMemo(
    () => ({
      tokenType: options.tokenType,
      token: options.token,
      since: sinceTime ? new Date(sinceTime) : undefined,
      until: untilTime ? new Date(untilTime) : undefined,
      ipAddress: options.ipAddress,
      limit: options.limit,
    }),
    [
      options.tokenType,
      options.token,
      sinceTime,
      untilTime,
      options.ipAddress,
      options.limit,
    ]
  );

  // Generate SWR key for each page
  const getKey = useCallback(
    (pageIndex: number, previousPageData: PaginatedResponse | null) => {
      // No username, don't fetch
      if (!username) return null;

      // Reached the end
      if (previousPageData && !previousPageData.nextCursor) return null;

      // First page, no cursor
      if (pageIndex === 0) {
        const queryString = buildQueryString(filterOptions);
        return `/auth/api/v1/users/${username}/token-change-history?${queryString}`;
      }

      // Add cursor from previous page
      const cursor = previousPageData?.nextCursor;
      const queryString = buildQueryString(filterOptions, cursor);
      return `/auth/api/v1/users/${username}/token-change-history?${queryString}`;
    },
    [username, filterOptions]
  );

  const { data, error, size, setSize, mutate, isLoading, isValidating } =
    useSWRInfinite<PaginatedResponse>(getKey, fetcher, {
      revalidateFirstPage: false,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
    });

  // Flatten all pages into a single array of entries
  const entries = useMemo(() => {
    if (!data) return undefined;
    return data.flatMap((page) => page.entries);
  }, [data]);

  // Determine if there are more pages
  const hasMore = useMemo(() => {
    if (!data || data.length === 0) return false;
    const lastPage = data[data.length - 1];
    return !!lastPage.nextCursor;
  }, [data]);

  // Get total count from first page
  const totalCount = useMemo(() => {
    if (!data || data.length === 0) return undefined;
    return data[0].totalCount ?? undefined;
  }, [data]);

  // Loading more is when we're validating and not on the first load
  const isLoadingMore = isValidating && size > 0;

  // Load more function
  const loadMore = useCallback(() => {
    setSize((currentSize) => currentSize + 1);
  }, [setSize]);

  return {
    entries,
    isLoading,
    error,
    hasMore,
    totalCount,
    loadMore,
    isLoadingMore,
    mutate,
  };
}
