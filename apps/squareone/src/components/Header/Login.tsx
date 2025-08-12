/* Login component */

import useUserInfo from '../../hooks/useUserInfo';
import UserMenu from './UserMenu';
import { PrimaryNavigation, getLoginUrl } from '@lsst-sqre/squared';

type LoginProps = {
  pageUrl: URL;
};

export default function Login({ pageUrl }: LoginProps) {
  const { isLoggedIn } = useUserInfo();

  if (isLoggedIn === true) {
    return <UserMenu pageUrl={pageUrl} />;
  }

  return (
    <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl.toString())}>
      Log in
    </PrimaryNavigation.TriggerLink>
  );
}
