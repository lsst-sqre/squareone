import type { ContentNode } from '@lsst-sqre/times-square-client';
import { describe, expect, it } from 'vitest';

import { buildFocusHref, getFocusBreadcrumb, resolveFocus } from './navFocus';

const contentNodes: ContentNode[] = [
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
          {
            node_type: 'directory',
            title: 'weather-archive',
            path: 'lsst-sqre/times-square-demo/weather-archive',
            contents: [],
          },
        ],
      },
    ],
  },
];

describe('resolveFocus', () => {
  it('resolves an exact container path to its node and ancestor chain', () => {
    const resolved = resolveFocus(
      contentNodes,
      'lsst-sqre/times-square-demo/weather'
    );
    expect(resolved?.node.path).toBe('lsst-sqre/times-square-demo/weather');
    expect(resolved?.ancestors.map((node) => node.path)).toEqual([
      'lsst-sqre',
      'lsst-sqre/times-square-demo',
    ]);
  });

  it('resolves a top-level container with an empty ancestor chain', () => {
    const resolved = resolveFocus(contentNodes, 'lsst-sqre');
    expect(resolved?.node.node_type).toBe('owner');
    expect(resolved?.ancestors).toEqual([]);
  });

  it('resolves a page path to its containing directory', () => {
    const resolved = resolveFocus(
      contentNodes,
      'lsst-sqre/times-square-demo/weather/summit-weather'
    );
    expect(resolved?.node.path).toBe('lsst-sqre/times-square-demo/weather');
  });

  it('resolves a stale path to the nearest existing ancestor', () => {
    const resolved = resolveFocus(
      contentNodes,
      'lsst-sqre/times-square-demo/weather/deleted/deep'
    );
    expect(resolved?.node.path).toBe('lsst-sqre/times-square-demo/weather');
  });

  it('does not treat a sibling sharing a string prefix as an ancestor', () => {
    const resolved = resolveFocus(
      contentNodes,
      'lsst-sqre/times-square-demo/weather-archive/deleted'
    );
    expect(resolved?.node.path).toBe(
      'lsst-sqre/times-square-demo/weather-archive'
    );
  });

  it('returns null when no path segment matches the tree', () => {
    expect(resolveFocus(contentNodes, 'other-org/other-repo')).toBeNull();
  });

  it('returns null for an empty focus path', () => {
    expect(resolveFocus(contentNodes, '')).toBeNull();
  });
});

describe('getFocusBreadcrumb', () => {
  it('returns the ancestor chain, excluding the focused node itself', () => {
    const resolved = resolveFocus(
      contentNodes,
      'lsst-sqre/times-square-demo/weather'
    );
    expect(resolved && getFocusBreadcrumb(resolved)).toEqual([
      { title: 'lsst-sqre', path: 'lsst-sqre' },
      { title: 'times-square-demo', path: 'lsst-sqre/times-square-demo' },
    ]);
  });

  it('returns no crumbs for a top-level focus', () => {
    const resolved = resolveFocus(contentNodes, 'lsst-sqre');
    expect(resolved && getFocusBreadcrumb(resolved)).toEqual([]);
  });
});

describe('buildFocusHref', () => {
  it('sets ts_nav_focus on a bare path', () => {
    const href = buildFocusHref('/times-square/github/a/b', '', 'lsst-sqre');
    const [path, query] = href.split('?');
    expect(path).toBe('/times-square/github/a/b');
    expect(new URLSearchParams(query).get('ts_nav_focus')).toBe('lsst-sqre');
  });

  it('replaces an existing ts_nav_focus while preserving other parameters', () => {
    const href = buildFocusHref(
      '/times-square/github/a/b',
      'ts_nav_focus=lsst-sqre%2Frepo&myparam=42',
      'lsst-sqre'
    );
    const params = new URLSearchParams(href.split('?')[1]);
    expect(params.get('ts_nav_focus')).toBe('lsst-sqre');
    expect(params.get('myparam')).toBe('42');
  });

  it('removes ts_nav_focus when focus is cleared', () => {
    const href = buildFocusHref(
      '/times-square/github/a/b',
      'ts_nav_focus=lsst-sqre&myparam=42',
      null
    );
    const params = new URLSearchParams(href.split('?')[1]);
    expect(params.get('ts_nav_focus')).toBeNull();
    expect(params.get('myparam')).toBe('42');
  });

  it('returns the bare path when clearing leaves no parameters', () => {
    expect(
      buildFocusHref('/times-square/github/a/b', 'ts_nav_focus=lsst-sqre', null)
    ).toBe('/times-square/github/a/b');
  });
});
