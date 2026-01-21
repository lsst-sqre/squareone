/* Login component with proper hydration handling */

import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import { getLoginUrl, PrimaryNavigation } from '@lsst-sqre/squared';
import { useEffect, useState } from 'react';

import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import styles from './Login.module.css';
import UserMenu from './UserMenu';

type LoginProps = {
  pageUrl: URL;
};

export default function Login({ pageUrl }: LoginProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const repertoireUrl = useRepertoireUrl();
  const { isLoggedIn, isLoading } = useUserInfo(repertoireUrl);

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
