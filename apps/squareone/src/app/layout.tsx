import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Global CSS imports (must match _app.tsx and .storybook/preview.js)
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@lsst-sqre/global-css/dist/next.css';
import '../styles/icons';

import { ConfigProvider } from '../contexts/rsc';
import { getStaticConfig } from '../lib/config/rsc';
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
 *
 * Provider hierarchy matches _app.tsx:
 * PlausibleWrapper (conditional)
 *   └─ ConfigProvider
 *        └─ Providers (ThemeProvider)
 *             └─ {children}
 *
 * Note: Unlike Pages Router, the Page shell (Header, Footer) is NOT included
 * here. Each page route should include its own page structure to allow for
 * different layouts (e.g., sidebar layouts, full-width pages).
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  // Load config on server - Promise passed to client provider
  const configPromise = getStaticConfig();
  const config = await configPromise;

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <SentryConfigScript config={config} />
      </head>
      <body>
        <PlausibleWrapper domain={config.plausibleDomain}>
          <ConfigProvider configPromise={getStaticConfig()}>
            <Providers>{children}</Providers>
          </ConfigProvider>
        </PlausibleWrapper>
      </body>
    </html>
  );
}
