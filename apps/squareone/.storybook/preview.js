// Load global CSS and icons; same as how _app.js loads these resources.
// Next can't load global CSS from anywhere _but_ _app.js, so there isn't a way
// to single-source these imports.

// Source Sans Pro Font from Font Source
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';

// Global CSS
import 'normalize.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
// import '@lsst-sqre/rubin-style-dictionary/dist/tokens.css';
// import '@lsst-sqre/rubin-style-dictionary/dist/tokens.dark.css';
import '../src/styles/globals.css';
import '../src/styles/icons';

import { withGlobalStyles } from './decorators';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [withGlobalStyles];
