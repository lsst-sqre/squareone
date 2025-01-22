import PropTypes from 'prop-types';
import getConfig from 'next/config';
import { ThemeProvider } from 'next-themes';
import PlausibleProvider from 'next-plausible';

// Global CSS
// Keep these imports in sync with .storybook/preview.js (Next can't import
// global CSS from a separate module.)
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@lsst-sqre/global-css/dist/next.css';
import '../styles/icons';

import Page from '../components/Page';

function MyApp({
  Component,
  pageProps,
  baseUrl,
  semaphoreUrl,
  plausibleDomain,
}) {
  // Use the content layout defined by the page component, if avaialble.
  // Otherwise, the page itself is used as the content area layout container.
  const getLayout = Component.getLayout || ((page) => page);

  /* eslint-disable react/jsx-props-no-spreading */
  const coreApp = (
    <ThemeProvider defaultTheme="system">
      <Page baseUrl={baseUrl} semaphoreUrl={semaphoreUrl}>
        {getLayout(<Component {...pageProps} />)}
      </Page>
    </ThemeProvider>
  );
  /* eslint-enable react/jsx-props-no-spreading */
  if (!plausibleDomain) {
    return coreApp;
  }
  return (
    <PlausibleProvider domain={plausibleDomain}>{coreApp}</PlausibleProvider>
  );
}

MyApp.getInitialProps = async () => {
  const { publicRuntimeConfig } = getConfig();
  const { baseUrl, semaphoreUrl, plausibleDomain } = publicRuntimeConfig;
  return { baseUrl, semaphoreUrl, plausibleDomain };
};

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
  baseUrl: PropTypes.string.isRequired,
  semaphoreUrl: PropTypes.string,
  plausibleDomain: PropTypes.string,
};

export default MyApp;
