import path from 'node:path';
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
  ],

  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      nextConfigPath: path.resolve(__dirname, '../next.config.js'),
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

  staticDirs: ['../public'],

  async viteFinal(config) {
    // Configure Vite to resolve monorepo packages correctly
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lsst-sqre/rubin-style-dictionary': path.resolve(
        __dirname,
        '../../../packages/rubin-style-dictionary'
      ),
      '@lsst-sqre/squared': path.resolve(
        __dirname,
        '../../../packages/squared'
      ),
      '@lsst-sqre/global-css': path.resolve(
        __dirname,
        '../../../packages/global-css'
      ),
    };

    return config;
  },
};

export default config;
