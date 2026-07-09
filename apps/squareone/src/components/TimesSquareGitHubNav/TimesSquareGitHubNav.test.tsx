import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TimesSquareGitHubNav from './TimesSquareGitHubNav';

let mockPathname = '/times-square/github';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

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
  mockPathname = '/times-square/github';
  mockSearchParams = new URLSearchParams();
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

  it('marks the focused ancestor of the current page as current in focus mode', () => {
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath="lsst-sqre/times-square-demo/weather/summit-weather"
        focusPath="lsst-sqre/times-square-demo/weather"
      />
    );
    expect(
      screen.getByRole('button', { name: 'Toggle weather' }).closest('div')
    ).toHaveAttribute('aria-current', 'true');
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

/** Extract the `ts_nav_focus` value from an element's href, if any. */
function focusParamOf(element: HTMLElement): string | null {
  const query = element.getAttribute('href')?.split('?')[1] ?? '';
  return new URLSearchParams(query).get('ts_nav_focus');
}

describe('TimesSquareGitHubNav focus mode', () => {
  it('renders the focused node as the tree root under a breadcrumb', () => {
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath={null}
        focusPath="lsst-sqre/times-square-demo/weather"
      />
    );

    // The breadcrumb lists the ancestors as refocus links and the focused
    // node as the current location.
    const breadcrumb = screen.getByRole('list', { name: 'Focus breadcrumb' });
    expect(
      within(breadcrumb).getByRole('link', { name: 'lsst-sqre' })
    ).toBeVisible();
    expect(
      within(breadcrumb).getByRole('link', { name: 'times-square-demo' })
    ).toBeVisible();
    expect(
      within(breadcrumb).getByText('weather').closest('li')
    ).toHaveAttribute('aria-current', 'location');

    // The focused node is the tree root: its ancestors are not tree rows.
    expect(
      screen.getByRole('button', { name: 'Toggle weather' })
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Toggle lsst-sqre' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Toggle times-square-demo' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Summit Weather' })).toBeVisible();
  });

  it('links breadcrumb segments to refocus on that ancestor', () => {
    mockPathname =
      '/times-square/github/lsst-sqre/times-square-demo/weather/summit-weather';
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath="lsst-sqre/times-square-demo/weather/summit-weather"
        focusPath="lsst-sqre/times-square-demo/weather"
      />
    );
    const breadcrumb = screen.getByRole('list', { name: 'Focus breadcrumb' });
    const repoLink = within(breadcrumb).getByRole('link', {
      name: 'times-square-demo',
    });
    expect(repoLink.getAttribute('href')).toMatch(
      new RegExp(`^${mockPathname}\\?`)
    );
    expect(focusParamOf(repoLink)).toBe('lsst-sqre/times-square-demo');
  });

  it('clears focus while preserving other query parameters', () => {
    mockPathname =
      '/times-square/github/lsst-sqre/times-square-demo/weather/summit-weather';
    mockSearchParams = new URLSearchParams({
      ts_nav_focus: 'lsst-sqre/times-square-demo/weather',
      myparam: '42',
    });
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath="lsst-sqre/times-square-demo/weather/summit-weather"
        focusPath="lsst-sqre/times-square-demo/weather"
      />
    );
    const clearLink = screen.getByRole('link', { name: 'Clear focus' });
    const [path, query] = (clearLink.getAttribute('href') ?? '').split('?');
    expect(path).toBe(mockPathname);
    const params = new URLSearchParams(query);
    expect(params.get('ts_nav_focus')).toBeNull();
    expect(params.get('myparam')).toBe('42');
  });

  it('propagates ts_nav_focus onto sidebar page links', () => {
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath={null}
        focusPath="lsst-sqre/times-square-demo/weather"
      />
    );
    const pageLink = screen.getByRole('link', { name: 'Summit Weather' });
    expect(pageLink.getAttribute('href')).toMatch(
      /^\/times-square\/github\/lsst-sqre\/times-square-demo\/weather\/summit-weather\?/
    );
    expect(focusParamOf(pageLink)).toBe('lsst-sqre/times-square-demo/weather');
  });

  it('does not add ts_nav_focus to page links without focus', () => {
    renderNav();
    const pageLink = screen.getByRole('link', { name: 'Summit Weather' });
    expect(pageLink.getAttribute('href')).toBe(
      '/times-square/github/lsst-sqre/times-square-demo/weather/summit-weather'
    );
  });

  it('focuses the nearest existing ancestor for a stale focus path', () => {
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath={null}
        focusPath="lsst-sqre/times-square-demo/weather/deleted-directory"
      />
    );
    const breadcrumb = screen.getByRole('list', { name: 'Focus breadcrumb' });
    expect(
      within(breadcrumb).getByText('weather').closest('li')
    ).toHaveAttribute('aria-current', 'location');
    expect(
      screen.getByRole('button', { name: 'Toggle weather' })
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Toggle lsst-sqre' })
    ).not.toBeInTheDocument();
    // Breadcrumb refocus links carry the resolved (existing) path.
    expect(
      focusParamOf(screen.getByRole('link', { name: 'Summit Weather' }))
    ).toBe('lsst-sqre/times-square-demo/weather');
  });

  it('shows a kebab menu button on every container row in the main tree', () => {
    renderNav();
    for (const name of [
      'Actions for lsst-sqre',
      'Actions for times-square-demo',
      'Actions for weather',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('opens a kebab menu whose action focuses that node via ts_nav_focus', async () => {
    const user = userEvent.setup();
    mockPathname =
      '/times-square/github/lsst-sqre/times-square-demo/weather/summit-weather';
    mockSearchParams = new URLSearchParams({ myparam: '42' });
    renderNav('lsst-sqre/times-square-demo/weather/summit-weather');

    await user.click(
      screen.getByRole('button', { name: 'Actions for weather' })
    );
    const menuItem = within(document.body).getByRole('menuitem', {
      name: 'Focus on this directory',
    });
    const [path, query] = (menuItem.getAttribute('href') ?? '').split('?');
    expect(path).toBe(mockPathname);
    const params = new URLSearchParams(query);
    expect(params.get('ts_nav_focus')).toBe(
      'lsst-sqre/times-square-demo/weather'
    );
    expect(params.get('myparam')).toBe('42');
  });

  it('labels the focus action with the row node type', async () => {
    const user = userEvent.setup();
    renderNav();

    await user.click(
      screen.getByRole('button', { name: 'Actions for lsst-sqre' })
    );
    const menuItem = within(document.body).getByRole('menuitem', {
      name: 'Focus on this organization',
    });
    expect(focusParamOf(menuItem)).toBe('lsst-sqre');
    await user.keyboard('{Escape}');

    await user.click(
      screen.getByRole('button', { name: 'Actions for times-square-demo' })
    );
    expect(
      within(document.body).getByRole('menuitem', {
        name: 'Focus on this repository',
      })
    ).toBeInTheDocument();
  });

  it('shows the kebab on container rows inside a focused view to focus deeper', async () => {
    const user = userEvent.setup();
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath={null}
        focusPath="lsst-sqre/times-square-demo"
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Actions for weather' })
    );
    const menuItem = within(document.body).getByRole('menuitem', {
      name: 'Focus on this directory',
    });
    expect(focusParamOf(menuItem)).toBe('lsst-sqre/times-square-demo/weather');
  });

  it('is keyboard operable: the kebab opens a menu and Escape returns focus', async () => {
    const user = userEvent.setup();
    renderNav();

    const kebab = screen.getByRole('button', { name: 'Actions for weather' });
    kebab.focus();
    await user.keyboard('{Enter}');
    const menu = within(document.body).getByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(
      within(menu).getByRole('menuitem', { name: 'Focus on this directory' })
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(within(document.body).queryByRole('menu')).not.toBeInTheDocument();
    expect(kebab).toHaveFocus();
  });

  it('shows no kebab or focus UI in the PR-preview tree', () => {
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github-pr"
        pagePath={null}
      />
    );
    expect(
      screen.queryByRole('button', { name: /^Actions for / })
    ).not.toBeInTheDocument();
  });

  it('opens a previously collapsed directory when it becomes the focus root', () => {
    // A prior visit collapsed the directory that is now being focused.
    window.sessionStorage.setItem(
      'times-square-github-nav:/times-square/github',
      JSON.stringify(['lsst-sqre/times-square-demo/weather'])
    );
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath={null}
        focusPath="lsst-sqre/times-square-demo/weather"
      />
    );
    // The focused root is forced open, so its children are visible rather than
    // hidden under a collapsed row.
    expect(
      screen.getByRole('button', { name: 'Toggle weather' })
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Summit Weather' })).toBeVisible();
  });

  it('keeps the focused root open after collapse-all', async () => {
    const user = userEvent.setup();
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath={null}
        focusPath="lsst-sqre/times-square-demo/weather"
      />
    );
    await user.click(screen.getByRole('button', { name: 'Collapse all' }));
    // The focused root stays expanded so the tree is never blanked.
    expect(
      screen.getByRole('button', { name: 'Toggle weather' })
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Summit Weather' })).toBeVisible();
  });

  it('renders the full tree when no focus path segment matches', () => {
    render(
      <TimesSquareGitHubNav
        contentNodes={contentNodes}
        pagePathRoot="/times-square/github"
        pagePath={null}
        focusPath="other-org/other-repo"
      />
    );
    expect(
      screen.queryByRole('list', { name: 'Focus breadcrumb' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Clear focus' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Toggle lsst-sqre' })
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Summit Weather' }).getAttribute('href')
    ).toBe(
      '/times-square/github/lsst-sqre/times-square-demo/weather/summit-weather'
    );
  });
});
