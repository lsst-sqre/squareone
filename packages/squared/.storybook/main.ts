// This file has been automatically migrated to valid ESM format by Storybook.

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: ['../public'],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },

  async viteFinal(config) {
    // Ensure we exclude the NextJS-specific imports that cause conflicts
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude || []),
      'sb-original/image-context',
      '@storybook/nextjs-vite',
    ];

    // Ensure we're using the React framework, not NextJS
    config.define = config.define || {};
    config.define['process.env.STORYBOOK_FRAMEWORK'] = '"react-vite"';

    return config;
  },
};
export default config;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
