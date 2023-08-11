import PropTypes from 'prop-types';
import getConfig from 'next/config';
import { ThemeProvider } from 'next-themes';

// Global CSS
// Keep these imports in sync with .storybook/preview.js (Next can't import
// global CSS from a separate module.)
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@lsst-sqre/global-css/dist/next.css';
import '../styles/globals.css';
import '../styles/icons';

import Page from '../components/Page';

function MyApp({ Component, pageProps, baseUrl, semaphoreUrl }) {
  // Use the content layout defined by the page component, if avaialble.
  // Otherwise, the page itself is used as the content area layout container.
  const getLayout = Component.getLayout || ((page) => page);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ThemeProvider defaultTheme="system">
      <Page baseUrl={baseUrl} semaphoreUrl={semaphoreUrl}>
        {getLayout(<Component {...pageProps} />)}
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
