'use client';

import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import { PrimaryNavigation } from '@lsst-sqre/squared';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import useCurrentUrl from '../../hooks/useCurrentUrl';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';
import AppsMenu from './AppsMenu';
import styles from './HeaderNav.module.css';
import Login from './Login';

type InternalTriggerLinkProps = {
  href: string;
  children: ReactNode;
};

/*
 * Navigation (within the Header).
 *
 * Service availability is determined by the Repertoire service discovery API.
 * When repertoireUrl is not configured, all services are shown with fallback URLs.
 * When configured, only available services are displayed. During loading, items
 * are shown with fallback URLs to avoid layout shift (data is prefetched anyway).
 */
export default function HeaderNav() {
  const currentUrl = useCurrentUrl();
  const { enableAppsMenu } = useStaticConfig();
  const repertoireUrl = useRepertoireUrl();

  // Service discovery
  const { query, isPending } = useServiceDiscovery(repertoireUrl ?? '');

  // Determine visibility - show by default when discovery not configured
  // Show during loading to avoid layout shift (data is prefetched in App Router)
  const isConfigured = !!repertoireUrl;
  const showPortal =
    !isConfigured || isPending || query?.hasPortal({ hasUi: true });
  const showNublado =
    !isConfigured || isPending || query?.hasNublado({ hasUi: true });

  // Get URLs from discovery or use fallbacks
  const portalUrl = query?.getPortalUrl() ?? '/portal/app';
  const nubladoUrl = query?.getNubladoUrl() ?? '/nb/hub';

  return (
    <PrimaryNavigation className={styles.nav}>
      {showPortal && (
        <PrimaryNavigation.Item className={styles.navItem}>
          <PrimaryNavigation.TriggerLink href={portalUrl}>
            Portal
          </PrimaryNavigation.TriggerLink>
        </PrimaryNavigation.Item>
      )}

      {showNublado && (
        <PrimaryNavigation.Item className={styles.navItem}>
          <PrimaryNavigation.TriggerLink href={nubladoUrl}>
            Notebooks
          </PrimaryNavigation.TriggerLink>
        </PrimaryNavigation.Item>
      )}

      <PrimaryNavigation.Item className={styles.navItem}>
        <InternalTriggerLink href="/api-aspect">APIs</InternalTriggerLink>
      </PrimaryNavigation.Item>

      {enableAppsMenu && (
        <PrimaryNavigation.Item className={styles.navItem}>
          <AppsMenu />
        </PrimaryNavigation.Item>
      )}

      <PrimaryNavigation.Item className={styles.navItem}>
        <InternalTriggerLink href="/docs">Documentation</InternalTriggerLink>
      </PrimaryNavigation.Item>

      <PrimaryNavigation.Item className={styles.navItem}>
        <InternalTriggerLink href="/support">Support</InternalTriggerLink>
      </PrimaryNavigation.Item>

      <PrimaryNavigation.Item className={styles.navItem}>
        <PrimaryNavigation.TriggerLink href="https://community.lsst.org">
          Community
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>

      <Login pageUrl={currentUrl} />
    </PrimaryNavigation>
  );
}

function InternalTriggerLink({ href, children }: InternalTriggerLinkProps) {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <PrimaryNavigation.TriggerLink asChild active={isActive}>
      <NextLink href={href}>{children}</NextLink>
    </PrimaryNavigation.TriggerLink>
  );
}
