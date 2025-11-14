import type { Meta, StoryFn } from '@storybook/nextjs-vite';
import React from 'react';

import GitHubEditLink from './GitHubEditLink';

export default {
  component: GitHubEditLink,
  title: 'Components/TimesSquare/GitHubEditLink',
  parameters: {
    viewport: {
      viewports: {
        sidebar: {
          name: 'Sidebar',
          styles: {
            width: '280px',
            height: '900px',
          },
        },
      },
    },
    defaultViewport: 'sidebar',
  },
} as Meta<typeof GitHubEditLink>;

const Template: StoryFn<typeof GitHubEditLink> = (args) => (
  <GitHubEditLink {...args} />
);

export const Default = Template.bind({});
Default.args = {
  owner: 'lsst-sqre',
  repository: 'times-square-demo',
  sourcePath: 'demo.ipynb',
};
