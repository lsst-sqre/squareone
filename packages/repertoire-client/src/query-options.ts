import {
  defaultLogger,
  type Logger,
  type ReportContext,
  type ReportError,
  reportingQueryFn,
} from '@lsst-sqre/api-client-core';
import { queryOptions } from '@tanstack/react-query';
import {
  fetchServiceDiscovery,
  getEmptyDiscovery,
  getLastGoodDiscovery,
} from './client';
import type { ServiceDiscovery } from './types';

/** Configuration for {@link discoveryQueryOptions}. */
export type DiscoveryQueryConfig = {
  logger?: Logger;
  /**
   * Hook invoked for report-worthy failures (contract drift, 5xx, server-side
   * network errors). Injected by the app so this package stays Sentry-agnostic;
   * see `@lsst-sqre/api-client-core`'s `reportingQueryFn`.
   */
  reportError?: ReportError;
  /** Context (e.g. `{ site, package }`) forwarded to `reportError`. */
  context?: ReportContext;
  /**
   * Runtime override forwarded to `reportingQueryFn`: server-side, the request
   * is aborted after a timeout, a network-level failure is retried once, and
   * one that persists is report-worthy. Defaults to auto-detection.
   */
  isServer?: boolean;
};

export const discoveryQueryOptions = (
  repertoireUrl: string,
  options?: DiscoveryQueryConfig
) => {
  const logger = options?.logger ?? defaultLogger;
  const { reportError, context, isServer } = options ?? {};

  // The shared reporting wrapper fetches, logs every failure, retries a
  // server-side connection failure once, and invokes the injected
  // `reportError` for report-worthy failures (ZodError contract drift, 5xx,
  // server-side network errors and timeouts). On a failure it returns null,
  // and the query function below picks the document to degrade to.
  const fetchDiscovery = reportingQueryFn<ServiceDiscovery | null>({
    // `signal` is set server-side and aborts the request on a timeout.
    fetchFn: (signal) => {
      const requestId = Math.random().toString(36).substring(7);
      const env = typeof window === 'undefined' ? 'server' : 'client';
      logger.debug(
        { requestId, env, repertoireUrl },
        'Discovery queryFn called'
      );
      // The module-level cache in `fetchServiceDiscovery` shares discovery
      // across server requests. In the browser TanStack Query is the cache,
      // so skip the module cache there: otherwise a `refetch` within its
      // TTL would return the cached document without asking Repertoire.
      return fetchServiceDiscovery(repertoireUrl, {
        requestId,
        logger,
        forceRefresh: env === 'client',
        signal,
        // Let every failure reach `reportingQueryFn`, even one that the last
        // good document could mask, so a connection reset is still retried
        // and a lasting failure is still reported.
        staleFallback: false,
      });
    },
    fallback: null,
    logger,
    reportError,
    context,
    isServer,
  });

  return queryOptions({
    queryKey: ['service-discovery', repertoireUrl] as const,
    // Degrade gracefully: server-side, to the last document fetched from
    // Repertoire, however old; otherwise (and always in the browser) to the
    // empty discovery.
    queryFn: async (): Promise<ServiceDiscovery> => {
      const discovery = await fetchDiscovery();
      if (discovery) {
        return discovery;
      }
      const lastGood = getLastGoodDiscovery(repertoireUrl);
      if (lastGood) {
        logger.warn(
          { repertoireUrl, ...context },
          'Using the last service discovery document received'
        );
        return lastGood;
      }
      return getEmptyDiscovery();
    },
    enabled: !!repertoireUrl,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
