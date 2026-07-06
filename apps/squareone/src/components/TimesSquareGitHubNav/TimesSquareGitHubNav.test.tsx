import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import TimesSquareGitHubNav from './TimesSquareGitHubNav';

type ContentNodes = ComponentProps<typeof TimesSquareGitHubNav>['contentNodes'];

const contentNodes: ContentNodes = [
  {
    node_type: 'owner',
    title: 'lsst-sqre',
    path: 'lsst-sqre',
    contents: [
      {
        node_type: 'repo',
        title: 'times-square-demo',
        path: 'lsst-sqre/times-square-demo',
        contents: [
          {
            node_type: 'directory',
            title: 'weather',
            path: 'lsst-sqre/times-square-demo/weather',
            contents: [
              {
                node_type: 'page',
                title: 'Summit Weather',
                path: 'lsst-sqre/times-square-demo/weather/summit-weather',
                contents: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

function renderNav(pagePath: string | null = null) {
  return render(
    <TimesSquareGitHubNav
      contentNodes={contentNodes}
      pagePathRoot="/times-square/github"
      pagePath={pagePath}
    />
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
});

/**
 * Each tree row renders a Lucide icon distinct to its node_type. Lucide
 * stamps each svg with a `lucide-<icon-name>` class, which these tests use
 * to identify the glyph within the row that owns it.
 */
describe('TimesSquareGitHubNav node type icons', () => {
  it('renders an organization icon on owner rows', () => {
    renderNav();
    const row = screen.getByText('lsst-sqre').closest('div');
    expect(row?.querySelector('svg.lucide-building-2')).not.toBeNull();
  });

  it('renders a repository icon on repo rows', () => {
    renderNav();
    const row = screen.getByText('times-square-demo').closest('div');
    expect(row?.querySelector('svg.lucide-book')).not.toBeNull();
  });

  it('renders a folder icon on directory rows', () => {
    renderNav();
    const row = screen.getByText('weather').closest('div');
    expect(row?.querySelector('svg.lucide-folder')).not.toBeNull();
  });

  it('renders a notebook page icon on page rows', () => {
    renderNav();
    const row = screen
      .getByRole('link', { name: 'Summit Weather' })
      .closest('div');
    expect(row?.querySelector('svg.lucide-file-text')).not.toBeNull();
  });

  it('renders expanded disclosure buttons on container rows by default', () => {
    renderNav();
    for (const name of [
      'Toggle lsst-sqre',
      'Toggle times-square-demo',
      'Toggle weather',
    ]) {
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    }
    expect(screen.getByRole('link', { name: 'Summit Weather' })).toBeVisible();
  });

  it('marks node type icons as decorative for assistive technology', () => {
    const { container } = renderNav();
    const icons = container.querySelectorAll(
      'svg.lucide-building-2, svg.lucide-book, svg.lucide-folder, svg.lucide-file-text'
    );
    expect(icons.length).toBe(4);
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
  });
});

describe('TimesSquareGitHubNav collapsible tree', () => {
  it('collapses a subtree when its disclosure button is clicked', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByRole('button', { name: 'Toggle weather' }));
    expect(
      screen.getByRole('button', { name: 'Toggle weather' })
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('link', { name: 'Summit Weather', hidden: true })
    ).not.toBeVisible();
  });

  it('re-expands a collapsed subtree on a second click', async () => {
    const user = userEvent.setup();
    renderNav();
    const toggle = screen.getByRole('button', { name: 'Toggle weather' });
    await user.click(toggle);
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Summit Weather' })).toBeVisible();
  });

  it('collapses every container with the collapse-all toolbar button', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByRole('button', { name: 'Collapse all' }));
    expect(
      screen.getByRole('button', { name: 'Toggle lsst-sqre' })
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'Summit Weather' })
    ).not.toBeInTheDocument();
  });

  it('expands every container with the expand-all toolbar button', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByRole('button', { name: 'Collapse all' }));
    await user.click(screen.getByRole('button', { name: 'Expand all' }));
    for (const name of [
      'Toggle lsst-sqre',
      'Toggle times-square-demo',
      'Toggle weather',
    ]) {
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    }
    expect(screen.getByRole('link', { name: 'Summit Weather' })).toBeVisible();
  });

  it('keeps the current page ancestor chain expanded after collapse-all', async () => {
    const user = userEvent.setup();
    renderNav('lsst-sqre/times-square-demo/weather/summit-weather');
    await user.click(screen.getByRole('button', { name: 'Collapse all' }));
    for (const name of [
      'Toggle lsst-sqre',
      'Toggle times-square-demo',
      'Toggle weather',
    ]) {
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    }
    expect(screen.getByRole('link', { name: 'Summit Weather' })).toBeVisible();
  });

  it('restores the collapsed state from sessionStorage on remount', async () => {
    const user = userEvent.setup();
    const { unmount } = renderNav();
    await user.click(screen.getByRole('button', { name: 'Toggle weather' }));
    unmount();

    renderNav();
    expect(
      screen.getByRole('button', { name: 'Toggle weather' })
    ).toHaveAttribute('aria-expanded', 'false');
  });
});

/**
 * Fixture with sibling nodes whose paths share a string prefix, to pin the
 * path-segment-aware current matching (a raw `startsWith` would mark both
 * siblings current).
 */
const prefixSiblingNodes: ContentNodes = [
  {
    node_type: 'owner',
    title: 'lsst-sqre',
    path: 'lsst-sqre',
    contents: [
      {
        node_type: 'repo',
        title: 'demo',
        path: 'lsst-sqre/demo',
        contents: [
          {
            node_type: 'directory',
            title: 'weather',
            path: 'lsst-sqre/demo/weather',
            contents: [
              {
                node_type: 'page',
                title: 'Summit',
                path: 'lsst-sqre/demo/weather/summit',
                contents: [],
              },
              {
                node_type: 'page',
                title: 'Summit Weather',
                path: 'lsst-sqre/demo/weather/summit-weather',
                contents: [],
              },
            ],
          },
          {
            node_type: 'directory',
            title: 'weather-archive',
            path: 'lsst-sqre/demo/weather-archive',
            contents: [
              {
                node_type: 'page',
                title: 'History',
                path: 'lsst-sqre/demo/weather-archive/history',
                contents: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('TimesSquareGitHubNav current page highlighting', () => {
  it('does not mark a sibling directory sharing a string prefix as current', () => {
    render(
      <TimesSquareGitHubNav
        contentNodes={prefixSiblingNodes}
        pagePathRoot="/times-square/github"
        pagePath="lsst-sqre/demo/weather-archive/history"
      />
    );
    expect(screen.getByText('weather-archive').closest('div')).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(screen.getByText('weather').closest('div')).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('does not mark a sibling page sharing a string prefix as current', () => {
    render(
      <TimesSquareGitHubNav
        contentNodes={prefixSiblingNodes}
        pagePathRoot="/times-square/github"
        pagePath="lsst-sqre/demo/weather/summit-weather"
      />
    );
    expect(
      screen.getByRole('link', { name: 'Summit Weather' })
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Summit' })).not.toHaveAttribute(
      'aria-current'
    );
  });
});
