/* The header's log-in control: the user menu, or a "Log in" link. */

import { getLoginUrl, PrimaryNavigation } from '@lsst-sqre/squared';
import { useUserInfo } from '../../hooks/useUserInfo';
import styles from './Login.module.css';
import UserMenu from './UserMenu';

type LoginProps = {
  pageUrl: URL;
};

/**
 * The user menu for a signed-in user, otherwise a "Log in" link.
 *
 * The root layout prefetches and hydrates user info, so the server render and
 * the first client render read the same answer: a signed-in user's menu is in
 * the server HTML, and an anonymous visitor's "Log in" link never turns into a
 * menu. When nothing was prefetched (`repertoireUrl` unset), user info is
 * loading on both renders, so both show the link until the browser's request
 * resolves.
 */
export default function Login({ pageUrl }: LoginProps) {
  // The app hook attaches the Sentry reporter, so report-worthy user-info
  // failures (contract drift, 5xx) are distinguishable from a genuine
  // not-logged-in state; auth 401/403 stay quiet (isLoggedIn is false).
  const { isLoggedIn, isLoading } = useUserInfo();

  if (isLoading || !isLoggedIn) {
    return (
      <PrimaryNavigation.Item className={styles.loginNavItem}>
        <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl.toString())}>
          Log in
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>
    );
  }

  return (
    <PrimaryNavigation.Item className={styles.loginNavItem}>
      <UserMenu pageUrl={pageUrl} />
    </PrimaryNavigation.Item>
  );
}
