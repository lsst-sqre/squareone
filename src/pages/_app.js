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

import Page from '../components/page';

// Add icons to the global Font Awesome library
library.add(faAngleDown);

function MyApp({ Component, pageProps, baseUrl, semaphoreUrl }) {
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ThemeProvider defaultTheme="system">
      <Page baseUrl={baseUrl} semaphoreUrl={semaphoreUrl}>
        <Component {...pageProps} />
      </Page>
    </ThemeProvider>
  );
  /* eslint-enable react/jsx-props-no-spreading */
}

MyApp.getInitialProps = async () => {
  const { publicRuntimeConfig } = getConfig();
  const { baseUrl, semaphoreUrl } = publicRuntimeConfig;
  return { baseUrl, semaphoreUrl };
};

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
  baseUrl: PropTypes.string.isRequired,
  semaphoreUrl: PropTypes.string,
};

export default MyApp;
