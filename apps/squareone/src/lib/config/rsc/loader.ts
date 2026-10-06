/**
 * RSC-optimized configuration loader with React cache() for request deduplication.
 *
 * This module wraps the existing loadAppConfig() with React's cache() function
 * to ensure configuration is loaded only once per request across all server
 * components in the App Router. It also resolves the discovery-backed defaults
 * (`siteName`, `environmentName`, `baseUrl`) so every consumer sees resolved
 * values.
 */

import {
  fetchServiceDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { headers } from 'next/headers';
import { cache } from 'react';

import logger from '../../logger';
import {
  type AppConfig,
  loadAppConfig as loadAppConfigBase,
  loadMdxContent as loadMdxContentBase,
  type SentryConfig,
} from '../loader';
import {
  hasUnsetDefaultedKeys,
  needsRequestHeaders,
  resolveConfigDefaults,
  type StaticConfig,
} from '../resolveConfigDefaults';

// Re-export types for convenience
export type { AppConfig, SentryConfig, StaticConfig };

/**
 * Fetch Repertoire service discovery for resolving config defaults.
 *
 * Returns null without fetching when Repertoire is not configured or when the
 * config already sets every discovery-backed key. Discovery being unavailable
 * must never fail config loading, so errors are logged and swallowed; the
 * defaults then fall through to their non-discovery fallbacks.
 * `fetchServiceDiscovery` caches the document across requests, so this shares
 * the fetch made by the root layout's discovery prefetch.
 */
async function loadDiscoveryForDefaults(
  config: AppConfig
): Promise<ServiceDiscovery | null> {
  if (!config.repertoireUrl || !hasUnsetDefaultedKeys(config)) {
    return null;
  }
  try {
    return await fetchServiceDiscovery(config.repertoireUrl, { logger });
  } catch (err) {
    logger.warn(
      { err, repertoireUrl: config.repertoireUrl },
      'Service discovery unavailable; config defaults use fallbacks'
    );
    return null;
  }
}

/**
 * RSC-optimized config loader with React cache() for request deduplication.
 *
 * Uses React's cache() to ensure the config is loaded only once per request,
 * even if multiple server components call this function. This provides
 * automatic request-level memoization without manual caching logic.
 *
 * Unset `siteName`, `environmentName`, and `baseUrl` keys are resolved with
 * {@link resolveConfigDefaults} from Repertoire discovery and, for `baseUrl`
 * as a last step, from the request headers (read only when needed).
 *
 * @returns Promise resolving to the resolved application configuration
 *
 * @example
 * ```tsx
 * // In any server component
 * export default async function MyComponent() {
 *   const config = await getStaticConfig();
 *   return <div>{config.siteName}</div>;
 * }
 * ```
 */
export const getStaticConfig = cache(async (): Promise<StaticConfig> => {
  const config = await loadAppConfigBase();
  const discovery = await loadDiscoveryForDefaults(config);
  const requestHeaders = needsRequestHeaders(config, discovery)
    ? await headers()
    : null;
  return resolveConfigDefaults(config, discovery, requestHeaders);
});

/**
 * RSC-optimized MDX content loader with React cache() for request deduplication.
 *
 * Loads raw MDX content from the filesystem. The content path is resolved
 * relative to the mdxDir configured in the app configuration.
 *
 * @param contentPath - Path to MDX file relative to mdxDir (e.g., 'docs.mdx')
 * @returns Promise resolving to raw MDX content string
 *
 * @example
 * ```tsx
 * const mdxContent = await getMdxContent('docs.mdx');
 * ```
 */
export const getMdxContent = cache(
  async (contentPath: string): Promise<string> => {
    const config = await getStaticConfig();
    return loadMdxContentBase(contentPath, config);
  }
);
