// For adding publicRuntimeConfig to Storybook
import { setConfig } from 'next/config';
import type { Preview } from '@storybook/react';

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

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

// Set the Next.js public runtime configuration that's used by storybook stories.
// This should match the publicRuntimeConfig in next.config.js.
setConfig({
  publicRuntimeConfig: {
    siteName: 'Rubin Science Platform',
    siteDescription:
      'The Rubin Science Platform (RSP) provides web-based data access and analysis tools.',
    showPreview: true,
    previewLink: 'https://rsp.lsst.io/roadmap.html',
    docsBaseUrl: 'https://rsp.lsst.io',
    enableAppsMenu: false,
    appLinks: [],
    baseUrl: 'http://localhost:3000',
    coManageRegistryUrl: null,
    timesSquareUrl: null,
  },
});

export default preview;
