'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { getAdminNavigation } from '../../components/AdminLayout/adminNavigation';
// Import the helper from its module (not the SidebarLayout barrel) so this
// page does not pull in the SidebarLayout component itself.
import { getFirstNavItemHref } from '../../components/SidebarLayout/getFirstNavItemHref';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import type { AppConfigContextValue } from '../../hooks/useStaticConfig';

import styles from './AdminIndexClient.module.css';

type AdminIndexClientProps = {
  config: AppConfigContextValue;
};

/**
 * Client component behind the `/admin` index route.
 *
 * Sends each person to the first admin page *they* can see — the first item of
 * the scope-filtered sidebar navigation — so someone holding only, say,
 * `admin:oidc` lands on the OIDC clients page instead of bouncing off a page
 * they cannot use. Because the decision depends on the user's Gafaelfawr
 * scopes, which are only known client-side (`useLoginInfo`), this is a
 * client-side `router.replace()` rather than a server `redirect()`.
 *
 * When no admin page is visible there is nowhere to go, so the page renders an
 * explanatory state instead of redirecting. It also holds that state back
 * while login info is still loading, so an authorized user never flashes
 * "no admin pages available" before their scopes arrive.
 */
export default function AdminIndexClient({ config }: AdminIndexClientProps) {
  const router = useRouter();
  const repertoireUrl = useRepertoireUrl();
  const { query, isLoading } = useLoginInfo(repertoireUrl);

  const scopes = query?.scopes ?? [];
  const target = isLoading
    ? null
    : getFirstNavItemHref(getAdminNavigation(config, scopes));

  useEffect(() => {
    if (target) {
      router.replace(target);
    }
  }, [router, target]);

  if (isLoading || target) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin</h1>
      <p>No admin pages are available for your account.</p>
    </div>
  );
}
