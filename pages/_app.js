import PropTypes from 'prop-types';
import getConfig from 'next/config';
import { ThemeProvider } from 'next-themes';

// Icons from Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Source Sans Pro Font from Font Source
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';

// Global CSS
import 'normalize.css';
import '@lsst-sqre/rubin-style-dictionary/dist/tokens.css';
import '@lsst-sqre/rubin-style-dictionary/dist/tokens.dark.css';
import '../styles/globals.css';

import { useLogin } from '../hooks/login';
import Page from '../components/page';
import gfmToHtml from '../utils/gfmToHtml';

// Add icons to the global Font Awesome library
library.add(faAngleDown);

function MyApp({ Component, pageProps, baseUrl, broadcast }) {
  const loginData = useLogin(baseUrl);
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ThemeProvider defaultTheme="system">
      <Page loginData={loginData} baseUrl={baseUrl} broadcast={broadcast}>
        <Component {...pageProps} />
      </Page>
    </ThemeProvider>
  );
  /* eslint-enable react/jsx-props-no-spreading */
}

MyApp.getInitialProps = async () => {
  const { publicRuntimeConfig } = getConfig();
  const { baseUrl, broadcastMarkdown } = publicRuntimeConfig;
  const broadcast = broadcastMarkdown
    ? await gfmToHtml(broadcastMarkdown)
    : null;
  console.log(`broadcast: ${broadcast}`);
  return { baseUrl, broadcast };
};

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
  baseUrl: PropTypes.string.isRequired,
  broadcast: PropTypes.string,
};

export default MyApp;
