/*
 * The navigational sidebar for Times Square.
 */

import { IconPill } from '@lsst-sqre/squared';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { getDocsUrl } from '../../lib/utils/docsUrls';
import styles from './Sidebar.module.css';

type SidebarProps = {
  pageNav?: ReactNode;
  pagePanel?: ReactNode;
};

export default function Sidebar({ pageNav, pagePanel }: SidebarProps) {
  const { docsBaseUrl } = useAppConfig();
  const docsUrl = getDocsUrl(docsBaseUrl, '/guides/times-square/index.html');

  return (
    <div className={styles.sidebar}>
      <Link href="/times-square">
        <p className={styles.appTitle}>Times Square</p>
      </Link>
      <IconPill
        icon={['fas', 'book']}
        text="Documentation"
        url={docsUrl}
        textColor="#ffffff"
        backgroundColor="var(--rsd-color-primary-600)"
      />
      {pagePanel && pagePanel}
      {pageNav && pageNav}
    </div>
  );
}
