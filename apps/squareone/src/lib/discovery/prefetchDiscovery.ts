/**
 * Server-side prefetch of Repertoire service discovery for the root layout.
 */

import { discoveryQueryOptions } from '@lsst-sqre/repertoire-client';
import type { QueryClient } from '@tanstack/react-query';

import logger from '../logger';
import { makeReportError } from '../sentry/reportError';

/**
 * Prefetch service discovery into the root layout's query client, so it is
 * dehydrated for the browser and the layout's other prefetches can read
 * service URLs from it.
 *
 * This is the site that reports a Repertoire outage: a failed request is
 * logged and, if report-worthy, reported to Sentry with the
 * `service-discovery` site tag. It then degrades to the last discovery
 * document the server received, which is hydrated as usual. With no such
 * document, the query is left failed rather than resolving to the empty
 * discovery, so nothing is dehydrated and the browser asks Repertoire itself
 * instead of showing no services until a reload. The layout's other
 * server-side consumers then find no discovery in `queryClient` and skip
 * their prefetches, as when `repertoireUrl` is unset.
 *
 * @param queryClient - The root layout's per-request query client
 * @param repertoireUrl - The configured Repertoire discovery URL
 */
export async function prefetchDiscovery(
  queryClient: QueryClient,
  repertoireUrl: string
): Promise<void> {
  await queryClient.prefetchQuery(
    discoveryQueryOptions(repertoireUrl, {
      logger,
      isServer: true,
      rethrowReportWorthy: true,
      reportError: makeReportError({ isServer: true }),
      context: { site: 'service-discovery', package: 'repertoire-client' },
    })
  );
}
