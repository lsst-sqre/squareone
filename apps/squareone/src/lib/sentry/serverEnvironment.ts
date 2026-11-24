/**
 * The Sentry `environment` for the Node.js server runtime.
 *
 * Server-side Sentry must tag events with the same environment as the browser,
 * which reads the resolved `environmentName` from `getStaticConfig()`. This
 * module resolves it once at startup, before `Sentry.init`, with the same
 * precedence (config, then discovery's `environment.label`, then the
 * fallback) by delegating to {@link resolveConfigDefaults}.
 */

import {
  fetchServiceDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';

import { type AppConfig, loadAppConfig } from '../config/loader';
import { resolveConfigDefaults } from '../config/resolveConfigDefaults';
import logger from '../logger';

/**
 * How long server startup waits for Repertoire service discovery before
 * falling back, so an unreachable or slow Repertoire can't delay server start.
 *
 * This is shorter than `fetchServiceDiscovery`'s own 5-second server-side
 * timeout, and deliberately separate from it: startup stops waiting here, but
 * the request carries on until Repertoire answers (filling the discovery cache
 * for the first page renders) or that timeout aborts it. Passing this value as
 * the request's `timeoutMs` instead would abort a slow but working Repertoire,
 * and the timeout would make the first renders fail fast without discovery.
 */
export const STARTUP_DISCOVERY_TIMEOUT_MS = 3000;

/**
 * Resolve the Sentry environment for the server, following the same
 * `environmentName` precedence as the browser's injected Sentry config.
 *
 * Discovery is fetched only when `environmentName` is unset and
 * `repertoireUrl` is set, and never for longer than
 * {@link STARTUP_DISCOVERY_TIMEOUT_MS}. A failed or timed-out fetch is logged
 * as a warning and resolves to the fallback; it never rejects.
 */
export async function resolveServerSentryEnvironment(): Promise<string> {
  const config = await loadAppConfig();
  const discovery = await loadStartupDiscovery(config);
  // Only environmentName is read, so request headers (which only feed the
  // baseUrl fallback) aren't needed.
  return resolveConfigDefaults(config, discovery, null).environmentName;
}

/**
 * Fetch discovery for resolving `environmentName`, bounded by
 * {@link STARTUP_DISCOVERY_TIMEOUT_MS}. Returns null when discovery isn't
 * needed, isn't configured, or isn't available in time.
 */
async function loadStartupDiscovery(
  config: AppConfig
): Promise<ServiceDiscovery | null> {
  if (config.environmentName || !config.repertoireUrl) {
    return null;
  }

  const timeoutMs = STARTUP_DISCOVERY_TIMEOUT_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(`Service discovery did not respond within ${timeoutMs} ms`)
        ),
      timeoutMs
    );
  });

  try {
    // A fetch that loses the race keeps running in the background, bounded by
    // its own timeout; race() has already attached a handler, so a late
    // rejection is not unhandled.
    return await Promise.race([
      fetchServiceDiscovery(config.repertoireUrl, { logger }),
      timeout,
    ]);
  } catch (err) {
    logger.warn(
      { err, repertoireUrl: config.repertoireUrl, timeoutMs },
      'Service discovery unavailable at startup; server Sentry environment uses the fallback'
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}
