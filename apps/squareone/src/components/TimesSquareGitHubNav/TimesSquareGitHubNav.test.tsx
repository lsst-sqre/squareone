import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';

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

function renderNav() {
  return render(
    <TimesSquareGitHubNav
      contentNodes={contentNodes}
      pagePathRoot="/times-square/github"
      pagePath={null}
    />
  );
}

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
