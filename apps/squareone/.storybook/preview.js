// Load global CSS and icons; same as how _app.js loads these resources.
// Next can't load global CSS from anywhere _but_ _app.js, so there isn't a way
// to single-source these imports.

// Source Sans Pro Font from Font Source
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';

// Global CSS
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@lsst-sqre/global-css/dist/next.css';
import '../src/styles/icons';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
