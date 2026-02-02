// Storybook configuration for component testing

import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/nextjs-vite';
import { Suspense } from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { QueryProvider } from '../src/contexts/QueryProvider';
import { ConfigProvider } from '../src/contexts/rsc';

// Load global CSS; same as how layout.tsx loads these resources.

// Source Sans Pro Font from Font Source
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';

// Global CSS
import '@lsst-sqre/global-css/dist/next.css';

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
      <ConfigProvider configPromise={Promise.resolve(mockAppConfig)}>
        <QueryProvider>
          <Suspense>
            <Story />
          </Suspense>
        </QueryProvider>
      </ConfigProvider>
    ),
  ],

  tags: ['autodocs'],
};

export default preview;
