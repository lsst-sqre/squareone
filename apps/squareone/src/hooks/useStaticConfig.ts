'use client';

/**
 * Unified hook for accessing static configuration.
 *
 * This hook provides a seamless way to access configuration in components
 * that are shared between App Router and Pages Router:
 *
 * - **App Router**: Uses ConfigProvider (RSC pattern with React 19's use() hook)
 * - **Pages Router**: Falls back to AppConfigProvider (synchronous pattern)
 *
 * This enables gradual migration from Pages Router to App Router without
 * duplicating components or creating conditional logic in each component.
 */

import { use, useContext } from 'react';

import {
  AppConfigContext,
  type AppConfigContextValue,
} from '../contexts/AppConfigContext';
import { ConfigContext } from '../contexts/rsc/ConfigProvider';

/**
 * Hook to access static configuration in client components.
 *
 * Works with both router patterns:
 * - App Router: Suspends until config promise resolves (via ConfigProvider)
 * - Pages Router: Returns already-resolved config (via AppConfigProvider)
 *
 * @returns The static configuration object
 * @throws Error if used outside of both ConfigProvider and AppConfigProvider
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useStaticConfig } from '../hooks/useStaticConfig';
 *
 * function MyComponent() {
 *   const { siteName, docsBaseUrl } = useStaticConfig();
 *   return <h1>{siteName}</h1>;
 * }
 * ```
 */
export function useStaticConfig(): AppConfigContextValue {
  // Try RSC ConfigProvider first (App Router)
  const rscConfigPromise = useContext(ConfigContext);

  // Try AppConfigProvider (Pages Router)
  const appConfig = useContext(AppConfigContext);

  if (rscConfigPromise) {
    // App Router - use React 19's use() to resolve promise
    // Note: use() can be called conditionally (unlike other hooks)
    return use(rscConfigPromise);
  }

  if (appConfig) {
    // Pages Router - return already-resolved config
    return appConfig;
  }

  throw new Error(
    'useStaticConfig must be used within ConfigProvider (App Router) ' +
      'or AppConfigProvider (Pages Router). ' +
      'Make sure your component is wrapped in the appropriate provider.'
  );
}
