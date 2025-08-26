// Storybook configuration for component testing
import React from 'react';
import type { Preview } from '@storybook/nextjs';
import { AppConfigProvider } from '../src/contexts/AppConfigContext';

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

// Mock configuration for Storybook stories
const mockAppConfig = {
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
  environmentName: 'storybook',
  sentryDsn: null,
  semaphoreUrl: null,
  plausibleDomain: null,
};

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

  decorators: [
    (Story) => (
      <AppConfigProvider config={mockAppConfig}>
        <Story />
      </AppConfigProvider>
    ),
  ],

  tags: ['autodocs'],
};

export default preview;
