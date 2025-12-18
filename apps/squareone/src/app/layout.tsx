import { discoveryQueryOptions } from '@lsst-sqre/repertoire-client';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Force dynamic rendering so config is loaded at request time.
// This is required because SENTRY_DSN and other config values are only
// available at runtime (via Kubernetes ConfigMaps), not at build time.
export const dynamic = 'force-dynamic';

// Global CSS imports (must match _app.tsx and .storybook/preview.js)
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@lsst-sqre/global-css/dist/next.css';
import '../styles/icons';

import BroadcastBannerStack from '../components/BroadcastBannerStack';
import Header from '../components/Header';
import styles from '../components/Page/Page.module.css';
import { ConfigProvider } from '../contexts/rsc';
import { getStaticConfig } from '../lib/config/rsc';
import { compileFooterMdxForRsc } from '../lib/mdx/rsc';
import FooterRsc from './FooterRsc';
import PlausibleWrapper from './PlausibleWrapper';
import Providers from './providers';
import SentryConfigScript from './SentryConfigScript';

/**
 * Static metadata for the application.
 * Page-specific metadata is defined in each page's generateMetadata function.
 */
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/rubin-favicon.svg', type: 'image/svg+xml' },
      { url: '/rubin-favicon-transparent-32px.png', rel: 'alternate icon' },
    ],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Root layout for the App Router.
 *
 * This layout:
 * 1. Imports global CSS (fonts, icons, design system)
 * 2. Loads configuration server-side
 * 3. Prefetches service discovery data from Repertoire API
 * 4. Injects Sentry config for client-side error tracking
 * 5. Sets up provider hierarchy (Plausible, Config, Theme, Query)
 * 6. Renders the page shell (Header, BroadcastBannerStack, Footer)
 *
 * Provider hierarchy matches _app.tsx:
 * PlausibleWrapper (conditional)
 *   └─ ConfigProvider
 *        └─ Providers (QueryProvider, ThemeProvider)
 *             └─ HydrationBoundary (prefetched query data)
 *                  └─ Page shell (Header, content, Footer)
 *
 * The page shell uses a sticky footer pattern so the footer stays at the
 * bottom of the viewport even on short pages.
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  // Load config on server - Promise passed to client provider
  const configPromise = getStaticConfig();
  const config = await configPromise;

  // Create QueryClient for server-side prefetching
  const queryClient = new QueryClient();

  // Prefetch service discovery if Repertoire URL is configured
  if (config.repertoireUrl) {
    await queryClient.prefetchQuery(
      discoveryQueryOptions(config.repertoireUrl)
    );
  }

  // Compile footer MDX once at layout level
  const footerMdxContent = await compileFooterMdxForRsc();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <SentryConfigScript config={config} />
      </head>
      <body>
        <PlausibleWrapper domain={config.plausibleDomain}>
          <ConfigProvider configPromise={getStaticConfig()}>
            <Providers>
              <HydrationBoundary state={dehydrate(queryClient)}>
                <div className={styles.layout}>
                  <div className={styles.upperContainer}>
                    <Header />
                    <BroadcastBannerStack semaphoreUrl={config.semaphoreUrl} />
                    {children}
                  </div>
                  <div className={styles.stickyFooterContainer}>
                    <FooterRsc mdxContent={footerMdxContent} />
                  </div>
                </div>
              </HydrationBoundary>
            </Providers>
          </ConfigProvider>
        </PlausibleWrapper>
      </body>
    </html>
  );
}
