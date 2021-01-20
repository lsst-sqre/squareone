/* Login component */

import PropTypes from 'prop-types';

import { apiStates } from '../hooks/login';

export const Login = ({ loginData }) => (
  <p>
    {loginData.state === apiStates.SUCCESS
      ? `Hello ${loginData.data.username}`
      : 'Login'}
  </p>
);

Login.propTypes = {
  loginData: PropTypes.object,
};
