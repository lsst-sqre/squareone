import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTreeExpansion } from './useTreeExpansion';

const allPaths = [
  'lsst-sqre',
  'lsst-sqre/times-square-demo',
  'lsst-sqre/times-square-demo/weather',
  'lsst-sqre/times-square-demo/analysis',
];

const storageKey = 'test:tree-expansion';

function renderTreeExpansion({
  currentPath = null,
  focusPath = null,
}: {
  currentPath?: string | null;
  focusPath?: string | null;
} = {}) {
  return renderHook(
    ({ currentPath: path, focusPath: focus }) =>
      useTreeExpansion({
        allPaths,
        currentPath: path,
        focusPath: focus,
        storageKey,
      }),
    { initialProps: { currentPath, focusPath } }
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
});

describe('useTreeExpansion', () => {
  it('expands every path by default', () => {
    const { result } = renderTreeExpansion();
    for (const path of allPaths) {
      expect(result.current.isExpanded(path)).toBe(true);
    }
  });

  it('collapses a path when toggled', () => {
    const { result } = renderTreeExpansion();
    act(() => {
      result.current.toggle('lsst-sqre/times-square-demo/weather');
    });
    expect(
      result.current.isExpanded('lsst-sqre/times-square-demo/weather')
    ).toBe(false);
    expect(result.current.isExpanded('lsst-sqre')).toBe(true);
  });

  it('re-expands a collapsed path when toggled again', () => {
    const { result } = renderTreeExpansion();
    act(() => {
      result.current.toggle('lsst-sqre');
    });
    act(() => {
      result.current.toggle('lsst-sqre');
    });
    expect(result.current.isExpanded('lsst-sqre')).toBe(true);
  });

  it('collapses every path with collapseAll', () => {
    const { result } = renderTreeExpansion();
    act(() => {
      result.current.collapseAll();
    });
    for (const path of allPaths) {
      expect(result.current.isExpanded(path)).toBe(false);
    }
  });

  it('expands every path with expandAll', () => {
    const { result } = renderTreeExpansion();
    act(() => {
      result.current.collapseAll();
    });
    act(() => {
      result.current.expandAll();
    });
    for (const path of allPaths) {
      expect(result.current.isExpanded(path)).toBe(true);
    }
  });

  it('restores collapsed state from sessionStorage in a new hook instance', () => {
    const first = renderTreeExpansion();
    act(() => {
      first.result.current.toggle('lsst-sqre/times-square-demo');
    });
    first.unmount();

    const second = renderTreeExpansion();
    expect(
      second.result.current.isExpanded('lsst-sqre/times-square-demo')
    ).toBe(false);
    expect(second.result.current.isExpanded('lsst-sqre')).toBe(true);
  });

  it('falls back to all-expanded when the stored value is malformed', () => {
    window.sessionStorage.setItem(storageKey, 'not json {');
    const { result } = renderTreeExpansion();
    for (const path of allPaths) {
      expect(result.current.isExpanded(path)).toBe(true);
    }
  });

  it('keeps the current page ancestor chain expanded after collapseAll', () => {
    const { result } = renderTreeExpansion({
      currentPath: 'lsst-sqre/times-square-demo/weather/summit-weather',
    });
    act(() => {
      result.current.collapseAll();
    });
    expect(result.current.isExpanded('lsst-sqre')).toBe(true);
    expect(result.current.isExpanded('lsst-sqre/times-square-demo')).toBe(true);
    expect(
      result.current.isExpanded('lsst-sqre/times-square-demo/weather')
    ).toBe(true);
    expect(
      result.current.isExpanded('lsst-sqre/times-square-demo/analysis')
    ).toBe(false);
  });

  it('collapses an ancestor of the current page immediately when toggled', () => {
    const { result } = renderTreeExpansion({
      currentPath: 'lsst-sqre/times-square-demo/weather/summit-weather',
    });
    // The ancestor is auto-revealed on mount.
    expect(result.current.isExpanded('lsst-sqre/times-square-demo')).toBe(true);

    act(() => {
      result.current.toggle('lsst-sqre/times-square-demo');
    });

    // Toggling an auto-revealed ancestor has an immediately visible effect,
    // rather than being masked at read time.
    expect(result.current.isExpanded('lsst-sqre/times-square-demo')).toBe(
      false
    );
    expect(
      JSON.parse(window.sessionStorage.getItem(storageKey) ?? '[]')
    ).toContain('lsst-sqre/times-square-demo');
  });

  it('reveals previously collapsed ancestors when navigating into them', () => {
    // A prior visit collapsed a container and persisted it.
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify(['lsst-sqre/times-square-demo'])
    );

    const { result, rerender } = renderTreeExpansion({ currentPath: null });
    expect(result.current.isExpanded('lsst-sqre/times-square-demo')).toBe(
      false
    );

    // Navigate to a page whose ancestor chain includes the collapsed node.
    act(() => {
      rerender({
        currentPath: 'lsst-sqre/times-square-demo/weather/summit-weather',
        focusPath: null,
      });
    });

    // The ancestor is revealed and pruned from the persisted collapsed set.
    expect(result.current.isExpanded('lsst-sqre/times-square-demo')).toBe(true);
    expect(
      JSON.parse(window.sessionStorage.getItem(storageKey) ?? '[]')
    ).not.toContain('lsst-sqre/times-square-demo');
  });

  it('reveals a previously collapsed focused node and prunes it from storage', () => {
    // A prior visit collapsed the container that is now being focused.
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify(['lsst-sqre/times-square-demo'])
    );

    const { result, rerender } = renderTreeExpansion({ focusPath: null });
    expect(result.current.isExpanded('lsst-sqre/times-square-demo')).toBe(
      false
    );

    // Focus that collapsed container: it becomes the tree root and must open.
    act(() => {
      rerender({
        currentPath: null,
        focusPath: 'lsst-sqre/times-square-demo',
      });
    });

    expect(result.current.isExpanded('lsst-sqre/times-square-demo')).toBe(true);
    expect(
      JSON.parse(window.sessionStorage.getItem(storageKey) ?? '[]')
    ).not.toContain('lsst-sqre/times-square-demo');
  });

  it('keeps the focused root expanded after collapseAll', () => {
    const { result } = renderTreeExpansion({
      focusPath: 'lsst-sqre/times-square-demo',
    });
    act(() => {
      result.current.collapseAll();
    });
    // The focused root stays expanded so the tree is never blanked.
    expect(result.current.isExpanded('lsst-sqre/times-square-demo')).toBe(true);
    // Its descendants still collapse.
    expect(
      result.current.isExpanded('lsst-sqre/times-square-demo/weather')
    ).toBe(false);
    expect(
      result.current.isExpanded('lsst-sqre/times-square-demo/analysis')
    ).toBe(false);
  });

  it('reports expandAll as a no-op while everything is expanded', () => {
    const { result } = renderTreeExpansion();
    expect(result.current.canExpandAll).toBe(false);
    expect(result.current.canCollapseAll).toBe(true);

    act(() => {
      result.current.toggle('lsst-sqre/times-square-demo/weather');
    });
    expect(result.current.canExpandAll).toBe(true);
  });

  it('reports collapseAll as a no-op once every path is collapsed', () => {
    const { result } = renderTreeExpansion();
    act(() => {
      result.current.collapseAll();
    });
    expect(result.current.canCollapseAll).toBe(false);
    expect(result.current.canExpandAll).toBe(true);
  });

  it('excludes revealed paths from canCollapseAll', () => {
    // Every path is either collapsed or force-revealed by the current page's
    // ancestor chain, so collapseAll can change nothing.
    const { result } = renderTreeExpansion({
      currentPath: 'lsst-sqre/times-square-demo/weather/summit-weather',
    });
    act(() => {
      result.current.collapseAll();
    });
    expect(result.current.canCollapseAll).toBe(false);
    // Only the non-revealed path ('analysis') actually collapsed.
    expect(result.current.canExpandAll).toBe(true);
  });

  it('ignores collapsed paths outside allPaths for canExpandAll', () => {
    // A path collapsed on a prior visit that is no longer rendered (e.g. it
    // is outside the focused subtree) must not enable expand-all.
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify(['other-org/other-repo'])
    );
    const { result } = renderTreeExpansion();
    expect(result.current.canExpandAll).toBe(false);
  });

  it('does not reveal a sibling path sharing a string prefix with an ancestor', () => {
    const { result } = renderTreeExpansion({
      currentPath: 'lsst-sqre/times-square-demo/weather-archive/history',
    });
    act(() => {
      result.current.collapseAll();
    });
    // 'weather' is a string prefix of 'weather-archive' but not a path
    // segment ancestor, so it must stay collapsed.
    expect(
      result.current.isExpanded('lsst-sqre/times-square-demo/weather')
    ).toBe(false);
    expect(
      result.current.isExpanded('lsst-sqre/times-square-demo/weather-archive')
    ).toBe(true);
  });
});
