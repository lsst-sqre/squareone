import type { ReactNode } from 'react';

import { useAppConfig } from '../../contexts/AppConfigContext';
import BroadcastBannerStack from '../BroadcastBannerStack';
import Footer from '../Footer';
import Header from '../Header';
import Meta from '../Meta';
import styles from './Page.module.css';

type PageProps = {
  children?: ReactNode;
  // biome-ignore lint/suspicious/noExplicitAny: MDX serialized source is an opaque type from next-mdx-remote
  footerMdxSource?: any;
};

/*
 * Page wrapper component that provides the default layout of navigation,
 * content, and footer.
 *
 * The layout uses a "sticky footer" pattern so that the Footer component
 * stays at the bottom of the page and the Header/MainContent components
 * take up any excess space. See
 * https://css-tricks.com/couple-takes-sticky-footer/
 */
export default function Page({ children, footerMdxSource }: PageProps) {
  const config = useAppConfig();

  return (
    <div className={styles.layout}>
      <Meta />
      <div className={styles.upperContainer}>
        <Header />
        <BroadcastBannerStack semaphoreUrl={config.semaphoreUrl} />
        {children}
      </div>
      <div className={styles.stickyFooterContainer}>
        <Footer mdxSource={footerMdxSource} />
      </div>
    </div>
  );
}
