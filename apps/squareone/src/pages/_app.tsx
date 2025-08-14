import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import getConfig from 'next/config';
import { ThemeProvider } from 'next-themes';
import PlausibleProvider from 'next-plausible';
import { SWRConfig } from 'swr';

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

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  baseUrl: string;
  semaphoreUrl?: string;
  plausibleDomain?: string;
};

function MyApp({
  Component,
  pageProps,
  baseUrl,
  semaphoreUrl,
  plausibleDomain,
}: AppPropsWithLayout) {
  // Use the content layout defined by the page component, if available.
  // Otherwise, the page itself is used as the content area layout container.
  const getLayout = Component.getLayout || ((page) => page);

  // SWR fallback data to ensure SSR compatibility
  const swrFallback: Record<string, any> = {
    '/auth/api/v1/user-info': null, // Fallback for unauthenticated state
    [`${semaphoreUrl}/v1/broadcasts`]: [], // Fallback for empty broadcasts
  };

  /* eslint-disable react/jsx-props-no-spreading */
  const coreApp = (
    <SWRConfig
      value={{
        fallback: swrFallback,
        revalidateOnFocus: true, // Keep background refresh behavior
        revalidateOnReconnect: true, // Refresh when network reconnects
        dedupingInterval: 2000, // Dedupe requests within 2 seconds
      }}
    >
      <ThemeProvider defaultTheme="system">
        <Page baseUrl={baseUrl} semaphoreUrl={semaphoreUrl}>
          {getLayout(<Component {...pageProps} />)}
        </Page>
      </ThemeProvider>
    </SWRConfig>
  );
  /* eslint-enable react/jsx-props-no-spreading */
  if (!plausibleDomain) {
    return coreApp;
  }
  return (
    <PlausibleProvider domain={plausibleDomain}>{coreApp}</PlausibleProvider>
  );
}

MyApp.getInitialProps = async () => {
  const { publicRuntimeConfig } = getConfig();
  const { baseUrl, semaphoreUrl, plausibleDomain } = publicRuntimeConfig;
  return { baseUrl, semaphoreUrl, plausibleDomain };
};

export default MyApp;
