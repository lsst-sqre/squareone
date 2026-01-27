import { mockGitHubContents } from '@lsst-sqre/times-square-client';
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

export const Default: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: '',
    pagePathRoot: '/times-square/github',
  },
};

export const ActivePage: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: 'lsst-sqre/times-square-demo/weather/summit-weather',
    pagePathRoot: '/times-square/github',
  },
};
