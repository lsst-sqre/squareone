import { classifyError, type ReportError } from '@lsst-sqre/api-client-core';
import {
  fetchServiceDiscovery,
  type Logger,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';

/**
 * Options shared by every server-side resolver that renders from Repertoire
 * service discovery (`resolveApiEndpoints`, `resolveDatasetDocs`,
 * `resolveServiceLink`).
 */
export type DiscoveryRenderOptions = {
  /** Configured Repertoire base URL, or undefined when discovery is not set. */
  repertoireUrl?: string;
  /** Optional server-side logger for recording fetch failures. */
  logger?: Logger;
  /**
   * Optional error reporter (e.g. Sentry) for report-worthy discovery failures.
   * When provided, a Repertoire outage or contract drift is forwarded so it is
   * distinguishable from an expected/quiet failure; the UI fallback is unchanged.
   */
  reportError?: ReportError;
};

export type FetchDiscoveryForRenderOptions = DiscoveryRenderOptions & {
  /** Sentry `site` tag naming the call site (e.g. `api-aspect-discovery`). */
  site: string;
  /**
   * What the discovery renders, completing the failure log message "Failed to
   * fetch service discovery for …" (e.g. `/api-aspect`).
   */
  purpose: string;
  /** Extra fields for the failure log and error report (e.g. `{ service }`). */
  context?: Record<string, unknown>;
};

/**
 * The outcome of fetching discovery for a server-rendered page.
 *
 * - `omitted`: no `repertoireUrl` configured, so discovery isn't consulted.
 * - `unavailable`: discovery was configured but the fetch/parse failed.
 * - `ok`: the discovery document.
 *
 * The first two are the shape every resolver's own result type shares, so a
 * resolver can return them as-is.
 */
export type DiscoveryForRender =
  | { status: 'omitted' }
  | { status: 'unavailable' }
  | { status: 'ok'; discovery: ServiceDiscovery };

/**
 * Fetch Repertoire service discovery for a server-rendered page, degrading
 * gracefully so the page always renders (the pattern `HeaderNav` established):
 * - no `repertoireUrl` -> `omitted`;
 * - a fetch/parse failure -> `unavailable`, and the error is logged
 *   server-side; report-worthy failures (a Repertoire 5xx outage, contract
 *   drift, or a network failure) are additionally forwarded to `reportError`,
 *   tagged with `site` and `package: 'squareone'`, so a real problem is
 *   distinguishable in Sentry from a quiet, expected failure (auth/other 4xx);
 * - success -> `ok` with the discovery document.
 *
 * Uses the repertoire-client's existing 5-minute in-process discovery cache,
 * so every caller on a page shares one discovery fetch.
 */
export async function fetchDiscoveryForRender({
  repertoireUrl,
  logger,
  reportError,
  site,
  purpose,
  context = {},
}: FetchDiscoveryForRenderOptions): Promise<DiscoveryForRender> {
  if (!repertoireUrl) {
    return { status: 'omitted' };
  }

  try {
    const discovery = await fetchServiceDiscovery(
      repertoireUrl,
      logger ? { logger } : undefined
    );
    return { status: 'ok', discovery };
  } catch (error) {
    logger?.error(
      { err: error, ...context },
      `Failed to fetch service discovery for ${purpose}`
    );
    // Runs during RSC rendering, so classify server-side: a Repertoire 5xx,
    // contract drift, or a network failure is report-worthy; auth/other 4xx
    // stays expected. The UI fallback ('unavailable') is unchanged either way.
    if (
      reportError &&
      classifyError(error, { isServer: true }) === 'report-worthy'
    ) {
      reportError(error, { site, package: 'squareone', ...context });
    }
    return { status: 'unavailable' };
  }
}
