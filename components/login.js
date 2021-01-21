/* Login component */

import PropTypes from 'prop-types';

import { apiStates } from '../hooks/login';

import { UserMenu } from './userMenu';

export const Login = ({ loginData }) => {
  if (loginData.state === apiStates.SUCCESS) {
    return <UserMenu loginData={loginData} />;
  }
  return <a href="/login">Log in</a>;
};

Login.propTypes = {
  loginData: PropTypes.object,
};
