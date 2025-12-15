import type { ReactNode } from 'react';
import BroadcastBannerStack from '../components/BroadcastBannerStack';
import Header from '../components/Header';
import Meta from '../components/Meta';
import styles from '../components/Page/Page.module.css';
import { AppConfigProvider } from '../contexts/AppConfigContext';
import { getStaticConfig, type StaticConfig } from '../lib/config/rsc';
import { compileFooterMdxForRsc } from '../lib/mdx/rsc';
import FooterRsc from './FooterRsc';

type PageShellProps = {
  children: ReactNode;
  /** Optional pre-loaded config to avoid duplicate loading */
  config?: StaticConfig;
};

/**
 * Page shell component for App Router.
 *
 * Provides the standard page structure with Header, BroadcastBanner stack,
 * main content area, and Footer. This is the RSC equivalent of the Pages
 * Router's Page component.
 *
 * The shell wraps children with AppConfigProvider so that existing components
 * (Header, Footer, etc.) that use useAppConfig() continue to work without
 * modification.
 *
 * @example
 * ```tsx
 * // In a page component
 * export default async function DocsPage() {
 *   return (
 *     <PageShell>
 *       <MainContent>
 *         <h1>Documentation</h1>
 *       </MainContent>
 *     </PageShell>
 *   );
 * }
 * ```
 */
export default async function PageShell({ children, config }: PageShellProps) {
  // Load config if not provided
  const staticConfig = config ?? (await getStaticConfig());

  // Load and compile footer MDX
  const footerMdxContent = await compileFooterMdxForRsc();

  return (
    <AppConfigProvider config={staticConfig}>
      <div className={styles.layout}>
        <Meta />
        <div className={styles.upperContainer}>
          <Header />
          <BroadcastBannerStack semaphoreUrl={staticConfig.semaphoreUrl} />
          {children}
        </div>
        <div className={styles.stickyFooterContainer}>
          <FooterRsc mdxContent={footerMdxContent} />
        </div>
      </div>
    </AppConfigProvider>
  );
}
