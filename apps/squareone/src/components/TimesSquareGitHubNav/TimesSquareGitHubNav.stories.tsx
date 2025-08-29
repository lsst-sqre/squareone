import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TimesSquareGitHubNav from './TimesSquareGitHubNav';

const meta: Meta<typeof TimesSquareGitHubNav> = {
  component: TimesSquareGitHubNav,
  title: 'Components/TimesSquare/GitHubNav',
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
};

export default meta;

type Story = StoryObj<typeof TimesSquareGitHubNav>;

const exampleGitHubContents = [
  {
    node_type: 'owner' as const,
    path: 'lsst-sqre',
    title: 'lsst-sqre',
    contents: [
      {
        node_type: 'repo' as const,
        path: 'lsst-sqre/times-square-demo',
        title: 'times-square-demo',
        contents: [
          {
            node_type: 'page' as const,
            path: 'lsst-sqre/times-square-demo/demo',
            title: 'Sine wave',
            contents: [],
          },
          {
            node_type: 'page' as const,
            path: 'lsst-sqre/times-square-demo/long',
            title: 'A page with a very long title that wraps',
            contents: [],
          },
          {
            node_type: 'dir' as const,
            path: 'lsst-sqre/times-square-demo/matplotlib',
            title: 'matplotlib',
            contents: [
              {
                node_type: 'page' as const,
                path: 'lsst-sqre/times-square-demo/matplotlib/gaussian2d',
                title: 'Gaussian 2D',
                contents: [],
              },
            ],
          },
          {
            node_type: 'dir' as const,
            path: 'lsst-sqre/times-square-demo/nightly',
            title: 'nightly',
            contents: [
              {
                node_type: 'page' as const,
                path: 'lsst-sqre/times-square-demo/nightly/auxtel',
                title: 'AuxTel Nightly Report',
                contents: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const Default: Story = {
  args: {
    contentNodes: exampleGitHubContents,
    pagePath: '',
    pagePathRoot: '/times-square/github',
  },
};

export const ActivePage: Story = {
  args: {
    contentNodes: exampleGitHubContents,
    pagePath: 'lsst-sqre/times-square-demo/matplotlib/gaussian2d',
    pagePathRoot: '/times-square/github',
  },
};
