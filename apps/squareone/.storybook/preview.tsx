// Storybook configuration for component testing

import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/nextjs-vite';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
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
  mdxDir: '/mock/mdx',
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

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },

  initialGlobals: {
    viewport: { value: 'responsive' },
  },

  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    (Story) => (
      <AppConfigProvider config={mockAppConfig}>
        <Story />
      </AppConfigProvider>
    ),
  ],

  tags: ['autodocs'],
};

export default preview;
