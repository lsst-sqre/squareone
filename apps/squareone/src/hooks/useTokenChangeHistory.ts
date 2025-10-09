import { useState, useCallback, useMemo, useEffect } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

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
  loadMore: () => Promise<void>;
  isLoadingMore: boolean;
  mutate: KeyedMutator<PaginatedResponse>;
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
  cursor?: string
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
 * Uses SWR for data fetching and caching with cursor-based pagination.
 * Accumulates entries across pages when loading more.
 *
 * @param username - The username to fetch token history for
 * @param options - Filter options (tokenType, token, since, until, ipAddress, limit)
 * @returns Object containing entries data, loading states, pagination state, and mutate function
 */
export default function useTokenChangeHistory(
  username: string | undefined,
  options: UseTokenChangeHistoryOptions = {}
): UseTokenChangeHistoryReturn {
  // Destructure options to avoid dependency array issues
  const { tokenType, token, since, until, ipAddress, limit } = options;

  const [accumulatedEntries, setAccumulatedEntries] = useState<
    TokenChangeHistoryEntry[]
  >([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Build the initial URL with filters
  const queryString = useMemo(
    () =>
      buildQueryString(
        { tokenType, token, since, until, ipAddress, limit },
        currentCursor
      ),
    [tokenType, token, since, until, ipAddress, limit, currentCursor]
  );

  const url = username
    ? `/auth/api/v1/users/${username}/token-change-history?${queryString}`
    : null;

  const { data, error, mutate } = useSWR<PaginatedResponse>(url, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  });

  // Reset accumulated entries when filters change (but not when cursor changes)
  useEffect(() => {
    if (!currentCursor) {
      setAccumulatedEntries([]);
    }
  }, [tokenType, token, since, until, ipAddress, limit, currentCursor]);

  // Accumulate entries when new data arrives
  useEffect(() => {
    if (data?.entries) {
      if (currentCursor) {
        // Loading more - append to existing entries
        setAccumulatedEntries((prev) => [...prev, ...data.entries]);
      } else {
        // Initial load or filter change - replace entries
        setAccumulatedEntries(data.entries);
      }
      setIsLoadingMore(false);
    }
  }, [data, currentCursor]);

  const loadMore = useCallback(async () => {
    if (!data?.nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    setCurrentCursor(data.nextCursor);
  }, [data?.nextCursor, isLoadingMore]);

  const isLoading = !error && !data && !!username;
  const hasMore = !!data?.nextCursor;
  const entries =
    accumulatedEntries.length > 0 ? accumulatedEntries : data?.entries;

  return {
    entries,
    isLoading,
    error,
    hasMore,
    totalCount: data?.totalCount ?? undefined,
    loadMore,
    isLoadingMore,
    mutate,
  };
}
