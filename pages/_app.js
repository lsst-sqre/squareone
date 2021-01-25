import PropTypes from 'prop-types';
import getConfig from 'next/config';

import '../styles/globals.css';
import { useLogin } from '../hooks/login';

function MyApp({ Component, pageProps }) {
  const { baseUrl } = pageProps;
  console.log(baseUrl);
  const loginData = useLogin(baseUrl);
  /* eslint-disable react/jsx-props-no-spreading */
  return <Component {...pageProps} loginData={loginData} />;
  /* eslint-enable react/jsx-props-no-spreading */
}

MyApp.getInitialProps = async () => {
  const { serverRuntimeConfig } = getConfig();
  const { baseUrl } = serverRuntimeConfig;
  return { baseUrl };
};

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
