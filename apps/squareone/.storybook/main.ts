import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: '../next.config.js',
    },
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  babel: async (options) => {
    return {
      ...options,
      presets: [
        [
          '@babel/preset-env',
          {
            targets: { browsers: ['defaults'] },
            modules: false,
          },
        ],
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
        [
          '@babel/preset-react',
          {
            runtime: 'automatic', // Use the new JSX transform
          },
        ],
      ],
    };
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: true,
  },
};

export default config;
