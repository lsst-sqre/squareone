import { PrimaryNavigation } from '@lsst-sqre/squared';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import { useAppConfig } from '../../contexts/AppConfigContext';
import useCurrentUrl from '../../hooks/useCurrentUrl';
import AppsMenu from './AppsMenu';
import styles from './HeaderNav.module.css';
import Login from './Login';

type InternalTriggerLinkProps = {
  href: string;
  children: ReactNode;
};

/*
 * Navigation (within the Header).
 */
export default function HeaderNav() {
  const currentUrl = useCurrentUrl();
  const { enableAppsMenu } = useAppConfig();

  return (
    <PrimaryNavigation className={styles.nav}>
      <PrimaryNavigation.Item className={styles.navItem}>
        <PrimaryNavigation.TriggerLink href="/portal/app">
          Portal
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>

      <PrimaryNavigation.Item className={styles.navItem}>
        <PrimaryNavigation.TriggerLink href="/nb/hub">
          Notebooks
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>

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
  const router = useRouter();
  const _isActive = href === router.pathname;

  return (
    <NextLink href={href}>
      {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */}
      <PrimaryNavigation.TriggerLink>{children}</PrimaryNavigation.TriggerLink>
    </NextLink>
  );
}
