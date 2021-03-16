import PropTypes from 'prop-types';
import getConfig from 'next/config';
import { ThemeProvider } from 'next-themes';

import 'normalize.css';
import '@lsst-sqre/rubin-style-dictionary/dist/tokens.css';
import '../styles/globals.css';
import { useLogin } from '../hooks/login';
import Page from '../components/page';

function MyApp({ Component, pageProps, baseUrl }) {
  const loginData = useLogin(baseUrl);
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ThemeProvider defaultTheme="system">
      <Page loginData={loginData} baseUrl={baseUrl}>
        <Component {...pageProps} />
      </Page>
    </ThemeProvider>
  );
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
