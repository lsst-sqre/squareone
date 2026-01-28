'use client';

/**
 * Hook for accessing static configuration in client components.
 *
 * Uses ConfigProvider (RSC pattern with React 19's use() hook) to resolve
 * the configuration promise provided by the App Router layout.
 */

import { use, useContext } from 'react';

import { ConfigContext } from '../contexts/rsc/ConfigProvider';
import type { AppConfig } from '../lib/config/loader';

export type { AppConfig as AppConfigContextValue } from '../lib/config/loader';

/**
 * Hook to access static configuration in client components.
 *
 * Suspends until config promise resolves (via ConfigProvider).
 *
 * @returns The static configuration object
 * @throws Error if used outside of ConfigProvider
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
export function useStaticConfig(): AppConfig {
  const rscConfigPromise = useContext(ConfigContext);

  if (rscConfigPromise) {
    return use(rscConfigPromise);
  }

  throw new Error(
    'useStaticConfig must be used within ConfigProvider. ' +
      'Make sure your component is wrapped in <ConfigProvider>.'
  );
}
