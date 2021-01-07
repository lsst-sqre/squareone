import PropTypes from 'prop-types';

import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  /* eslint-disable react/jsx-props-no-spreading */
  return <Component {...pageProps} />;
  /* eslint-enable react/jsx-props-no-spreading */
}

export default MyApp;

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
