/* Login component */

import PropTypes from 'prop-types';

import { apiStates } from '../hooks/login';

import { UserMenu } from './userMenu';

import { getLoginUrl } from '../utils/client/url';

export const Login = ({ loginData, pageUrl }) => {
  if (loginData.state === apiStates.SUCCESS) {
    return <UserMenu loginData={loginData} pageUrl={pageUrl} />;
  }
  return <a href={getLoginUrl(pageUrl)}>Log in</a>;
};

Login.propTypes = {
  loginData: PropTypes.object,
  pageUrl: PropTypes.string,
};
