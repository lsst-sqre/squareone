import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-styling';
import { withGlobalStyles } from './decorators';

// Import font assets and stylesheets with @font-face declarations
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';

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

export default preview;

// Match the behaviour of next-themes, https://github.com/pacocoursey/next-themes
// It could also be possible to use withThemeFromJSXProvider to use the
// ThemeProvider directly; see
// https://github.com/storybookjs/addon-styling/blob/next/docs/api.md#withthemefromjsxprovider
export const decorators = [
  withGlobalStyles,
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-theme',
  }),
];
