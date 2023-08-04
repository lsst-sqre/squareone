/* Login component */

import PropTypes from 'prop-types';

import { getLoginUrl } from '../../lib/utils/url';
import useUserInfo from '../../hooks/useUserInfo';
import UserMenu from './UserMenu';

export default function Login({ pageUrl }) {
  const { isLoggedIn } = useUserInfo();

  if (!isLoggedIn) {
    return <a href={getLoginUrl(pageUrl)}>Log in</a>;
  }
  return <UserMenu pageUrl={pageUrl} />;
}

Login.propTypes = {
  pageUrl: PropTypes.instanceOf(URL),
};
