'use client';

import React, { createContext, useContext } from 'react';

// Configuration interface for app-level configuration consumed by components
export interface AppConfigContextValue {
  siteName: string;
  baseUrl: string;
  semaphoreUrl?: string;
  plausibleDomain?: string;
  environmentName: string;
  siteDescription: string;
  docsBaseUrl: string;
  timesSquareUrl: string;
  coManageRegistryUrl: string;
  enableAppsMenu: boolean;
  appLinks: Array<{
    label: string;
    href: string;
    internal: boolean;
  }>;
  showPreview: boolean;
  previewLink?: string;
  mdxDir: string;
  footerMdxPath?: string;
  sentryDsn?: string;
  sentryTracesSampleRate?: number;
  sentryReplaysSessionSampleRate?: number;
  sentryReplaysOnErrorSampleRate?: number;
  sentryDebug?: boolean;
  headerLogoUrl?: string;
  headerLogoData?: string;
  headerLogoMimeType?: string;
  headerLogoHeight?: number;
  headerLogoWidth?: number;
  headerLogoAlt?: string;
}

// Exported for use by useStaticConfig unified hook
export const AppConfigContext = createContext<AppConfigContextValue | null>(
  null
);

type AppConfigProviderProps = {
  children: React.ReactNode;
  config: AppConfigContextValue;
};

/**
 * React Context Provider for application configuration.
 *
 * Provides configuration loaded from YAML files (via getServerSideProps)
 * to all components in the application tree, replacing the problematic
 * next/config pattern.
 */
export function AppConfigProvider({
  children,
  config,
}: AppConfigProviderProps) {
  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
}

/**
 * Hook to access application configuration from React components.
 *
 * @returns AppConfigContextValue - The application configuration
 * @throws Error if used outside of AppConfigProvider
 */
export function useAppConfig(): AppConfigContextValue {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error(
      'useAppConfig must be used within an AppConfigProvider. ' +
        'Make sure your component is wrapped in <AppConfigProvider>.'
    );
  }
  return context;
}
