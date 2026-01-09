/**
 * RSC-optimized configuration loader with React cache() for request deduplication.
 *
 * This module wraps the existing loadAppConfig() with React's cache() function
 * to ensure configuration is loaded only once per request across all server
 * components in the App Router.
 */

import { cache } from 'react';

import {
  type AppConfig,
  loadAppConfig as loadAppConfigBase,
  loadMdxContent as loadMdxContentBase,
  type SentryConfig,
} from '../loader';

// Re-export types for convenience
export type { AppConfig, SentryConfig };

/**
 * Type alias for App Router context.
 * StaticConfig is structurally identical to AppConfig, providing semantic
 * clarity in RSC contexts while maintaining compatibility.
 */
export type StaticConfig = AppConfig;

/**
 * RSC-optimized config loader with React cache() for request deduplication.
 *
 * Uses React's cache() to ensure the config is loaded only once per request,
 * even if multiple server components call this function. This provides
 * automatic request-level memoization without manual caching logic.
 *
 * @returns Promise resolving to the application configuration
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
  return loadAppConfigBase();
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
