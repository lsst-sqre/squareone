// This file has been automatically migrated to valid ESM format by Storybook.

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/nextjs-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
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

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
