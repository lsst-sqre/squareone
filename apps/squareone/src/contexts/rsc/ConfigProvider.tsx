'use client';

/**
 * RSC-compatible ConfigProvider for the App Router.
 *
 * This provider accepts a Promise<StaticConfig> and provides it via context.
 * Client components use the useConfig() hook which leverages React 19's use()
 * hook to suspend until the promise resolves.
 *
 * This pattern enables server components to load config and pass it to client
 * components without blocking rendering or duplicating data fetching logic.
 */

import { createContext, type ReactNode, use, useContext } from 'react';

import type { StaticConfig } from '../../lib/config/rsc';

// Context holds a Promise that resolves to StaticConfig
// Exported for use by useStaticConfig unified hook
export const ConfigContext = createContext<Promise<StaticConfig> | null>(null);

type ConfigProviderProps = {
  children: ReactNode;
  /** Promise resolving to static configuration */
  configPromise: Promise<StaticConfig>;
};

/**
 * RSC-compatible ConfigProvider for App Router.
 *
 * Accepts a Promise<StaticConfig> and provides it via context. Client
 * components use the useConfig() hook to access the resolved configuration.
 *
 * @example
 * ```tsx
 * // In root layout.tsx (server component)
 * export default async function RootLayout({ children }) {
 *   const configPromise = getStaticConfig();
 *
 *   return (
 *     <ConfigProvider configPromise={configPromise}>
 *       {children}
 *     </ConfigProvider>
 *   );
 * }
 * ```
 */
export function ConfigProvider({
  children,
  configPromise,
}: ConfigProviderProps) {
  return (
    <ConfigContext.Provider value={configPromise}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * Hook to access static configuration in client components.
 *
 * Uses React 19's use() hook to suspend until the config promise resolves.
 * Must be used within a ConfigProvider and wrapped in a Suspense boundary.
 *
 * @returns The resolved static configuration
 * @throws Error if used outside of ConfigProvider
 *
 * @example
 * ```tsx
 * // In a client component
 * 'use client';
 *
 * function MyComponent() {
 *   const config = useConfig();
 *   return <h1>{config.siteName}</h1>;
 * }
 * ```
 */
export function useConfig(): StaticConfig {
  const configPromise = useContext(ConfigContext);

  if (!configPromise) {
    throw new Error(
      'useConfig must be used within a ConfigProvider. ' +
        'Make sure your component is wrapped in <ConfigProvider>.'
    );
  }

  // React 19's use() hook suspends until the promise resolves
  return use(configPromise);
}
