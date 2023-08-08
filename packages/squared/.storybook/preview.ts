import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-styling';

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
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-theme',
  }),
];
