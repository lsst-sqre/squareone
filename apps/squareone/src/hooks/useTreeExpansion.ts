'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Parameters for {@link useTreeExpansion}.
 */
export type UseTreeExpansionOptions = {
  /** Paths of every collapsible (container) node in the tree. */
  allPaths: readonly string[];
  /**
   * Path of the currently viewed page (or `null` if not on a page). The
   * ancestor chain of this path is always forced open (auto-reveal).
   */
  currentPath: string | null;
  /** `sessionStorage` key under which collapsed paths are persisted. */
  storageKey: string;
};

/**
 * Expansion state and controls returned by {@link useTreeExpansion}.
 */
export type TreeExpansion = {
  /** Whether the container node at `path` is currently expanded. */
  isExpanded: (path: string) => boolean;
  /** Toggle the collapsed/expanded state of the container node at `path`. */
  toggle: (path: string) => void;
  /** Collapse every container node in the tree. */
  collapseAll: () => void;
  /** Expand every container node in the tree. */
  expandAll: () => void;
};

/**
 * Read the persisted collapsed-path set from `sessionStorage`.
 *
 * Returns an empty set (all expanded) when there is no stored value, the
 * value is malformed, or storage is unavailable (SSR, privacy modes).
 */
function readCollapsedPaths(storageKey: string): ReadonlySet<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    if (!stored) {
      return new Set();
    }
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(
      parsed.filter((item): item is string => {
        return typeof item === 'string';
      })
    );
  } catch {
    return new Set();
  }
}

/**
 * Compute the proper path-segment ancestors of a slash-delimited path.
 *
 * For `'a/b/c'` the ancestors are `'a'` and `'a/b'`. Matching is
 * segment-aware: `'a/b'` is an ancestor of `'a/b/c'` but `'a/b-sibling'`
 * shares only a string prefix and is not.
 */
export function getAncestorPaths(path: string): Set<string> {
  const ancestors = new Set<string>();
  const segments = path.split('/');
  for (let i = 1; i < segments.length; i += 1) {
    ancestors.add(segments.slice(0, i).join('/'));
  }
  return ancestors;
}

/**
 * Own the expansion state of a path-keyed navigation tree.
 *
 * State is stored as the set of *collapsed* paths so the default (empty set)
 * is all-expanded — matching the sidebar's historical behavior and keeping
 * newly appearing nodes expanded.
 */
export function useTreeExpansion({
  allPaths,
  currentPath,
  storageKey,
}: UseTreeExpansionOptions): TreeExpansion {
  const [collapsedPaths, setCollapsedPaths] = useState<ReadonlySet<string>>(
    () => readCollapsedPaths(storageKey)
  );

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify([...collapsedPaths])
      );
    } catch {
      // Storage may be unavailable (e.g. privacy modes); expansion state
      // simply won't persist.
    }
  }, [collapsedPaths, storageKey]);

  // The ancestor chain of the current page is always forced open
  // (auto-reveal) so the current page can never be hidden.
  const revealedPaths = useMemo(
    () => (currentPath ? getAncestorPaths(currentPath) : new Set<string>()),
    [currentPath]
  );

  const isExpanded = useCallback(
    (path: string) => revealedPaths.has(path) || !collapsedPaths.has(path),
    [collapsedPaths, revealedPaths]
  );

  const toggle = useCallback((path: string) => {
    setCollapsedPaths((previous) => {
      const next = new Set(previous);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedPaths(new Set(allPaths));
  }, [allPaths]);

  const expandAll = useCallback(() => {
    setCollapsedPaths(new Set());
  }, []);

  return useMemo(
    () => ({ isExpanded, toggle, collapseAll, expandAll }),
    [isExpanded, toggle, collapseAll, expandAll]
  );
}

export default useTreeExpansion;
