/* Login component with proper hydration handling */

import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import { getLoginUrl, PrimaryNavigation } from '@lsst-sqre/squared';
import { useEffect, useMemo, useState } from 'react';
import { makeReportError } from '@/lib/sentry/reportError';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import styles from './Login.module.css';
import UserMenu from './UserMenu';

type LoginProps = {
  pageUrl: URL;
};

export default function Login({ pageUrl }: LoginProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const repertoireUrl = useRepertoireUrl();

  // Inject the app's Sentry-backed reporter so report-worthy user-info failures
  // (ZodError contract drift, 5xx, server-side network errors) reach Sentry with
  // site context tags — making an API outage distinguishable from a genuine
  // not-logged-in state. Auth 401/403 stay quiet (isLoggedIn=false unchanged).
  // This header component mounts on every page, so it is the app-wide chokepoint
  // for the user-info query.
  const reportError = useMemo(() => makeReportError({ isServer: false }), []);
  const { isLoggedIn, isLoading } = useUserInfo(repertoireUrl, {
    reportError,
    context: { site: 'user-info', package: 'gafaelfawr-client' },
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Always render "Log in" link on server and initial client render
  // to avoid hydration mismatch
  if (!hasMounted) {
    return (
      <PrimaryNavigation.Item className={styles.loginNavItem}>
        <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl.toString())}>
          Log in
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>
    );
  }

  // After hydration, check loading state first
  if (isLoading) {
    return (
      <PrimaryNavigation.Item className={styles.loginNavItem}>
        <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl.toString())}>
          Log in
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>
    );
  }

  // Show appropriate content based on login status
  if (isLoggedIn === true) {
    return (
      <PrimaryNavigation.Item className={styles.loginNavItem}>
        <UserMenu pageUrl={pageUrl} />
      </PrimaryNavigation.Item>
    );
  }

  return (
    <PrimaryNavigation.Item className={styles.loginNavItem}>
      <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl.toString())}>
        Log in
      </PrimaryNavigation.TriggerLink>
    </PrimaryNavigation.Item>
  );
}
