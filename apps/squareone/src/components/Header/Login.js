/* Login component */

import PropTypes from 'prop-types';

import useUserInfo from '../../hooks/useUserInfo';
import UserMenu from './UserMenu';
import { PrimaryNavigation, getLoginUrl } from '@lsst-sqre/squared';

export default function Login({ pageUrl }) {
  const { isLoggedIn } = useUserInfo();

  if (isLoggedIn === true) {
    return <UserMenu pageUrl={pageUrl} />;
  }

  return (
    <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl)}>
      Log in
    </PrimaryNavigation.TriggerLink>
  );
}

Login.propTypes = {
  pageUrl: PropTypes.instanceOf(URL),
};
