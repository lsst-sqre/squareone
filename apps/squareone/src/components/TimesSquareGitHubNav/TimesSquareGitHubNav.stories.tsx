import { mockGitHubContents } from '@lsst-sqre/times-square-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import TimesSquareGitHubNav from './TimesSquareGitHubNav';

const meta: Meta<typeof TimesSquareGitHubNav> = {
  component: TimesSquareGitHubNav,
  title: 'Components/TimesSquare/GitHubNav',
  decorators: [
    // Expansion state persists in sessionStorage; clear it before each
    // story mounts so stories are deterministic and order-independent.
    (Story) => {
      window.sessionStorage.clear();
      return <Story />;
    },
  ],
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

    // Every container row is expanded by default.
    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole('button', { name: /^Toggle / })) {
      await expect(button).toHaveAttribute('aria-expanded', 'true');
    }
  },
};

export const ActivePage: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: 'lsst-sqre/times-square-demo/weather/summit-weather',
    pagePathRoot: '/times-square/github',
  },
};

export const Collapsed: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: '',
    pagePathRoot: '/times-square/github',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Toggle weather' });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // The collapsed subtree's pages are hidden from the accessibility tree.
    await expect(
      canvas.queryByRole('link', { name: 'Summit Weather Dashboard' })
    ).not.toBeInTheDocument();
    // Sibling subtrees stay expanded.
    await expect(
      canvas.getByRole('link', { name: 'Image Quality Analysis' })
    ).toBeVisible();
  },
};

export const AutoReveal: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: 'lsst-sqre/times-square-demo/weather/summit-weather',
    pagePathRoot: '/times-square/github',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse all' }));
    // The current page's ancestor chain stays open after collapse-all...
    await expect(
      canvas.getByRole('link', { name: 'Summit Weather Dashboard' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Toggle weather' })
    ).toHaveAttribute('aria-expanded', 'true');
    // ...while subtrees off the current path collapse.
    await expect(
      canvas.getByRole('button', { name: 'Toggle analysis' })
    ).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.queryByRole('link', { name: 'Image Quality Analysis' })
    ).not.toBeInTheDocument();
  },
};
