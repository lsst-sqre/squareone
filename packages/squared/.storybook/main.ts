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
    // Bare specifier: msw-storybook-addon@3 does not expose ./package.json in
    // its exports map, so getAbsolutePath() cannot resolve it.
    'msw-storybook-addon',
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
      // MicroLighter (CodeBlock) lazy-loads each language grammar with a
      // relative import(`./grammars/${language}.js`). Pre-bundling moves
      // MicroLighter into Vite's deps cache, where those grammar files don't
      // exist, so serve the package as-is.
      'microlighter',
    ];

    // For the same reason, production builds (build-storybook, Chromatic)
    // must expand MicroLighter's grammar import into per-language chunks.
    // Vite skips that transform for everything in node_modules by default.
    config.build = config.build || {};
    config.build.dynamicImportVarsOptions = {
      ...config.build.dynamicImportVarsOptions,
      exclude: [/node_modules\/(?!.*microlighter\/)/],
    };

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
