'use client';

import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import { useRepertoireUrl } from './useRepertoireUrl';

/**
 * The Semaphore URL plus the discovery status that produced it.
 *
 * `isResolving` and `isUnavailable` are mutually exclusive and let callers tell
 * the two reasons `url` can be `undefined` apart: still-resolving (keep showing
 * loading) versus settled-but-undiscovered (show a terminal unavailable state).
 */
export type SemaphoreUrlState = {
  /** The resolved Semaphore base URL, or `undefined` if not (yet) available. */
  url: string | undefined;
  /**
   * True while discovery genuinely hasn't settled — the Repertoire URL is not
   * yet available, or the discovery request is still in flight with no data and
   * no error.
   */
  isResolving: boolean;
  /**
   * True once discovery has settled (data present or errored) but there is still
   * no Semaphore URL, i.e. Semaphore is undiscoverable / unavailable.
   */
  isUnavailable: boolean;
};

/**
 * Hook to get the Semaphore service URL together with its discovery status.
 *
 * Resolves the Repertoire discovery URL from config and asks service discovery
 * for the Semaphore base URL, mirroring how `BroadcastBannerStack` and the RSC
 * layout discover Semaphore. The static `semaphoreUrl` config field is
 * deprecated in favour of discovery.
 *
 * Unlike {@link useSemaphoreUrl}, this companion surfaces *why* the URL is
 * absent so callers can distinguish a still-pending discovery from a settled
 * one that simply has no Semaphore — see {@link SemaphoreUrlState}.
 */
export function useSemaphoreUrlState(): SemaphoreUrlState {
  const repertoireUrl = useRepertoireUrl();
  const { discovery, query, isError } = useServiceDiscovery(
    repertoireUrl ?? ''
  );
  const url = query?.getSemaphoreUrl();

  // Discovery has "settled" once it has data or has errored. A disabled query
  // (empty Repertoire URL) reports neither, so it stays in the resolving state.
  const settled = discovery !== undefined || isError;

  return {
    url,
    isResolving: !settled,
    isUnavailable: settled && url === undefined,
  };
}

/**
 * Hook to get the Semaphore service URL from Repertoire service discovery.
 *
 * Thin wrapper over {@link useSemaphoreUrlState} that returns only the resolved
 * URL, keeping the existing signature for consumers that don't need to
 * distinguish a pending discovery from an unavailable one.
 *
 * @returns The Semaphore URL once discovered, or `undefined` while discovery is
 * pending or when Repertoire/Semaphore is undiscovered. Returning `undefined`
 * keeps dependent queries (broadcasts, admin notifications) disabled — the same
 * graceful degradation broadcasts already rely on.
 */
export function useSemaphoreUrl(): string | undefined {
  return useSemaphoreUrlState().url;
}
