/* Login component */

import PropTypes from 'prop-types';

import useUserInfo from '../../hooks/useUserInfo';

import { UserMenu } from './userMenu';

import { getLoginUrl } from '../../lib/utils/url';

export const Login = ({ pageUrl }) => {
  const { isLoggedIn } = useUserInfo();

  if (!isLoggedIn) {
    return <a href={getLoginUrl(pageUrl)}>Log in</a>;
  }
  return <UserMenu pageUrl={pageUrl} />;
};

Login.propTypes = {
  pageUrl: PropTypes.instanceOf(URL),
};
