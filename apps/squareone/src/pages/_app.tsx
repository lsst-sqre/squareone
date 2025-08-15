import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import { ThemeProvider } from 'next-themes';
import PlausibleProvider from 'next-plausible';

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
import { SentryProvider } from '../components/SentryProvider';

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

  /* eslint-disable react/jsx-props-no-spreading */
  const coreApp = (
    <AppConfigProvider config={config}>
      <SentryProvider>
        <ThemeProvider defaultTheme="system">
          <Page>{getLayout(<Component {...otherPageProps} />)}</Page>
        </ThemeProvider>
      </SentryProvider>
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
