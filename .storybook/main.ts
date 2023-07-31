import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/nextjs',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: true,
  },
};

export default config;
