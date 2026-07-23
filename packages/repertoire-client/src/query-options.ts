import {
  defaultLogger,
  type Logger,
  type ReportContext,
  type ReportError,
  reportingQueryFn,
} from '@lsst-sqre/api-client-core';
import { queryOptions } from '@tanstack/react-query';
import { fetchServiceDiscovery, getEmptyDiscovery } from './client';
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
   * Runtime override forwarded to the error classifier: controls whether
   * network-level failures are report-worthy. Defaults to auto-detection.
   */
  isServer?: boolean;
};

export const discoveryQueryOptions = (
  repertoireUrl: string,
  options?: DiscoveryQueryConfig
) => {
  const logger = options?.logger ?? defaultLogger;
  const { reportError, context, isServer } = options ?? {};

  return queryOptions({
    queryKey: ['service-discovery', repertoireUrl] as const,
    // Delegate to the shared reporting wrapper: it fetches, returns the empty
    // discovery fallback on any failure (graceful degradation preserved), logs
    // every failure, and invokes the injected `reportError` for report-worthy
    // ones (ZodError contract drift, 5xx, server-side network errors).
    queryFn: reportingQueryFn<ServiceDiscovery>({
      fetchFn: () => {
        const requestId = Math.random().toString(36).substring(7);
        const env = typeof window === 'undefined' ? 'server' : 'client';
        logger.debug(
          { requestId, env, repertoireUrl },
          'Discovery queryFn called'
        );
        return fetchServiceDiscovery(repertoireUrl, { requestId, logger });
      },
      fallback: getEmptyDiscovery(),
      logger,
      reportError,
      context,
      isServer,
    }),
    enabled: !!repertoireUrl,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
