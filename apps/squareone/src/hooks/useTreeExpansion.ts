'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
 * Remove every element of `remove` from `source`, returning `source`
 * unchanged (same reference) when nothing would change.
 *
 * Preserving the reference lets callers of `setState` bail out of a re-render
 * when the pruning is a no-op.
 */
function pruneSet(
  source: ReadonlySet<string>,
  remove: ReadonlySet<string>
): ReadonlySet<string> {
  let next: Set<string> | null = null;
  for (const path of remove) {
    if (source.has(path)) {
      if (next === null) {
        next = new Set(source);
      }
      next.delete(path);
    }
  }
  return next ?? source;
}

/**
 * Own the expansion state of a path-keyed navigation tree.
 *
 * State is stored as the set of *collapsed* paths so the default (empty set)
 * is all-expanded — matching the sidebar's historical behavior and keeping
 * newly appearing nodes expanded. `isExpanded` reads directly from this set
 * (its single source of truth), so `toggle` always has an immediately
 * visible effect.
 *
 * Auto-reveal is modeled as a state transition rather than a read-time mask:
 * whenever `currentPath` changes (including on mount/hydration) its ancestor
 * chain is pruned from the collapsed set — and thus from `sessionStorage` —
 * forcing the current page's containers open. `collapseAll` likewise leaves
 * that chain expanded.
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

  // Reconcile auto-reveal into the collapsed set: when the current page (and
  // therefore its ancestor chain) changes, prune those ancestors so they are
  // expanded — and persisted as such — rather than masked at read time.
  const revealedPathsRef = useRef(revealedPaths);
  revealedPathsRef.current = revealedPaths;
  useEffect(() => {
    setCollapsedPaths((previous) => pruneSet(previous, revealedPaths));
  }, [revealedPaths]);

  const isExpanded = useCallback(
    (path: string) => !collapsedPaths.has(path),
    [collapsedPaths]
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
    // Collapse everything except the current page's ancestor chain, which
    // stays expanded so the current page is never hidden.
    setCollapsedPaths(pruneSet(new Set(allPaths), revealedPathsRef.current));
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
