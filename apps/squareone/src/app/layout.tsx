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
 * 3. Injects Sentry config for client-side error tracking
 * 4. Sets up provider hierarchy (Plausible, Config, Theme)
 * 5. Renders the page shell (Header, BroadcastBannerStack, Footer)
 *
 * Provider hierarchy matches _app.tsx:
 * PlausibleWrapper (conditional)
 *   └─ ConfigProvider
 *        └─ Providers (ThemeProvider)
 *             └─ Page shell (Header, content, Footer)
 *
 * The page shell uses a sticky footer pattern so the footer stays at the
 * bottom of the viewport even on short pages.
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  // Load config on server - Promise passed to client provider
  const configPromise = getStaticConfig();
  const config = await configPromise;

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
            </Providers>
          </ConfigProvider>
        </PlausibleWrapper>
      </body>
    </html>
  );
}
