import PropTypes from 'prop-types';

import '../styles/globals.css';
import { useLogin } from '../hooks/login';

function MyApp({ Component, pageProps }) {
  const loginData = useLogin('http://localhost:3001/auth/api/v1/user-info');
  /* eslint-disable react/jsx-props-no-spreading */
  return <Component {...pageProps} loginData={loginData} />;
  /* eslint-enable react/jsx-props-no-spreading */
}

export default MyApp;

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
