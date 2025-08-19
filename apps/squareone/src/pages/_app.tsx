import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import PlausibleProvider from 'next-plausible';
import * as Sentry from '@sentry/nextjs';

// Global CSS
// Keep these imports in sync with .storybook/preview.js (Next can't import
// global CSS from a separate module.)
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@lsst-sqre/global-css/dist/next.css';
import '../styles/icons';

import Page from '../components/Page';
import {
  AppConfigProvider,
  AppConfigContextValue,
} from '../contexts/AppConfigContext';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  pageProps: {
    appConfig?: AppConfigContextValue;
    [key: string]: any;
  };
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the content layout defined by the page component, if available.
  // Otherwise, the page itself is used as the content area layout container.
  const getLayout = Component.getLayout || ((page) => page);

  // Extract appConfig from pageProps (provided by getServerSideProps)
  const { appConfig, ...otherPageProps } = pageProps;

  // If no appConfig is provided (e.g., API routes, error pages), provide a minimal fallback
  const fallbackConfig: AppConfigContextValue = {
    siteName: 'Rubin Science Platform',
    baseUrl: 'http://localhost:3000',
    environmentName: 'development',
    siteDescription: 'Welcome to the Rubin Science Platform',
    docsBaseUrl: 'https://rsp.lsst.io',
    timesSquareUrl: '',
    coManageRegistryUrl: '',
    enableAppsMenu: false,
    appLinks: [],
    showPreview: false,
    mdxDir: 'src/content/pages',
    sentryDsn: undefined,
    sentryTracesSampleRate: 0,
    sentryReplaysSessionSampleRate: 0,
    sentryReplaysOnErrorSampleRate: 1.0,
    sentryDebug: false,
  };

  const config = appConfig || fallbackConfig;

  // Initialize Sentry once per app lifecycle with AppConfig values
  useEffect(() => {
    // Check if Sentry is already initialized to prevent multiple instances
    if (Sentry.getClient()) {
      return;
    }

    // Initialize Sentry with configuration from AppConfig
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.environmentName,

      // Add optional integrations for additional features
      integrations: [Sentry.replayIntegration()],

      // Trace requests through any other Sentry-enabled service in the same
      // environment. By default, only requests to 'localhost' and requests that
      // start with '/' have trace headers added. Many of our requests to external
      // services use the fully qualified URL.
      tracePropagationTargets: [config.baseUrl],

      // Define how likely traces are sampled. Adjust this value in production, or
      // use tracesSampler for greater control.
      tracesSampleRate: config.sentryTracesSampleRate || 0,

      // Define how likely Replay events are sampled.
      replaysSessionSampleRate: config.sentryReplaysSessionSampleRate || 0,

      // Define how likely Replay events are sampled when an error occurs.
      replaysOnErrorSampleRate: config.sentryReplaysOnErrorSampleRate || 1.0,

      // Setting this option to true will print useful information to the console
      // while you're setting up Sentry.
      debug: config.sentryDebug || false,
    });
  }, [config]); // Depend on config to handle updates, but still guard against re-initialization

  /* eslint-disable react/jsx-props-no-spreading */
  const coreApp = (
    <AppConfigProvider config={config}>
      <ThemeProvider defaultTheme="system">
        <Page>{getLayout(<Component {...otherPageProps} />)}</Page>
      </ThemeProvider>
    </AppConfigProvider>
  );
  /* eslint-enable react/jsx-props-no-spreading */

  if (!config.plausibleDomain) {
    return coreApp;
  }
  return (
    <PlausibleProvider domain={config.plausibleDomain}>
      {coreApp}
    </PlausibleProvider>
  );
}

// No getInitialProps! Configuration is now loaded per-page in getServerSideProps
// and provided via AppConfigProvider context, eliminating SSR issues.
export default MyApp;
