import { mockGitHubContents } from '@lsst-sqre/times-square-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/times-square/github',
      },
    },
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

export const Focused: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: 'lsst-sqre/times-square-demo/weather/summit-weather',
    pagePathRoot: '/times-square/github',
    focusPath: 'lsst-sqre/times-square-demo/weather',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The breadcrumb shows the ancestors as refocus links and the focused
    // node as the current location, plus a clear control.
    const breadcrumb = canvas.getByRole('list', { name: 'Focus breadcrumb' });
    const crumbs = within(breadcrumb);
    await expect(
      canvas.getByRole('link', { name: 'Clear focus' })
    ).toBeVisible();
    const ownerCrumb = crumbs.getByRole('link', { name: 'lsst-sqre' });
    await expect(ownerCrumb).toBeVisible();
    await expect(ownerCrumb.getAttribute('href')).toContain('ts_nav_focus=');
    await expect(
      crumbs.getByRole('link', { name: 'times-square-demo' })
    ).toBeVisible();
    await expect(crumbs.getByText('weather')).toBeVisible();

    // The focused directory is the tree root: its ancestors are not rows.
    await expect(
      canvas.getByRole('button', { name: 'Toggle weather' })
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Toggle lsst-sqre' })
    ).not.toBeInTheDocument();

    // Page links inside the focused subtree carry the focus parameter, and
    // pages outside the subtree are not rendered.
    const pageLink = canvas.getByRole('link', {
      name: 'Summit Weather Dashboard',
    });
    await expect(pageLink.getAttribute('href')).toContain('ts_nav_focus=');
    await expect(
      canvas.queryByRole('link', { name: 'Image Quality Analysis' })
    ).not.toBeInTheDocument();
  },
};

export const KebabFocusMenu: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: '',
    pagePathRoot: '/times-square/github',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The kebab is invisible until the row is hovered or focused, but stays
    // in the tab order so keyboard users can reach it.
    const kebab = canvas.getByRole('button', { name: 'Actions for weather' });
    await expect(window.getComputedStyle(kebab).opacity).toBe('0');
    kebab.focus();
    await expect(window.getComputedStyle(kebab).opacity).toBe('1');

    // Activating the kebab opens a menu whose action focuses the node by
    // linking to the current page with ts_nav_focus set.
    await userEvent.click(kebab);
    const body = within(canvasElement.ownerDocument.body);
    const menuItem = await body.findByRole('menuitem', {
      name: 'Focus on this directory',
    });
    const href = menuItem.getAttribute('href') ?? '';
    const query = new URLSearchParams(href.split('?')[1] ?? '');
    await expect(query.get('ts_nav_focus')).toBe(
      'lsst-sqre/times-square-demo/weather'
    );

    // Escape closes the menu (Radix removes it asynchronously) and returns
    // focus to the kebab.
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('menuitem', { name: 'Focus on this directory' })
      ).not.toBeInTheDocument()
    );
    await expect(kebab).toHaveFocus();
  },
};

export const PrPreviewTree: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: null,
    pagePathRoot: '/times-square/github-pr',
  },
  play: async ({ canvasElement }) => {
    // The PR-preview tree gets icons and collapsing, but no kebab/focus UI.
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Toggle weather' })
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: /^Actions for / })
    ).not.toBeInTheDocument();
  },
};

export const FocusedStalePath: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: '',
    pagePathRoot: '/times-square/github',
    focusPath: 'lsst-sqre/times-square-demo/weather/deleted-directory',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The stale path resolves to its nearest existing ancestor (weather).
    const breadcrumb = canvas.getByRole('list', { name: 'Focus breadcrumb' });
    await expect(within(breadcrumb).getByText('weather')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Toggle weather' })
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Toggle lsst-sqre' })
    ).not.toBeInTheDocument();
  },
};

export const FocusedUnmatchedPath: Story = {
  args: {
    contentNodes: mockGitHubContents.contents,
    pagePath: '',
    pagePathRoot: '/times-square/github',
    focusPath: 'other-org/other-repo',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // An entirely unmatched focus path falls back to the full tree.
    await expect(
      canvas.queryByRole('list', { name: 'Focus breadcrumb' })
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Toggle lsst-sqre' })
    ).toBeVisible();
  },
};
