import PropTypes from 'prop-types';
import getConfig from 'next/config';

import '../styles/globals.css';
import { useLogin } from '../hooks/login';

function MyApp({ Component, pageProps, baseUrl }) {
  // console.log(`pageProps: ${pageProps}`);
  // const { baseUrl } = pageProps;
  console.log(`MyApp baseUrl: ${baseUrl}`);
  const loginData = useLogin(baseUrl);
  /* eslint-disable react/jsx-props-no-spreading */
  return <Component {...pageProps} loginData={loginData} baseUrl={baseUrl} />;
  /* eslint-enable react/jsx-props-no-spreading */
}

MyApp.getInitialProps = async () => {
  const { publicRuntimeConfig } = getConfig();
  const { baseUrl } = publicRuntimeConfig;
  return { baseUrl };
};

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
  baseUrl: PropTypes.string.isRequired,
};

export default MyApp;
