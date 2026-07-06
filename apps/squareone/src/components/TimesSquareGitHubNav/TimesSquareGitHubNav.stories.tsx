import { mockGitHubContents } from '@lsst-sqre/times-square-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

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
  play: async ({ canvasElement }) => {
    // Each node type renders its own Lucide icon: org (Building2),
    // repo (Book), directory (Folder), and page (FileText).
    await expect(
      canvasElement.querySelectorAll('svg.lucide-building-2').length
    ).toBeGreaterThan(0);
    await expect(
      canvasElement.querySelectorAll('svg.lucide-book').length
    ).toBeGreaterThan(0);
    await expect(
      canvasElement.querySelectorAll('svg.lucide-folder').length
    ).toBeGreaterThan(0);
    await expect(
      canvasElement.querySelectorAll('svg.lucide-file-text').length
    ).toBeGreaterThan(0);
  },
};

export const ActivePage: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: 'lsst-sqre/times-square-demo/weather/summit-weather',
    pagePathRoot: '/times-square/github',
  },
};
