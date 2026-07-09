/*
 * Focus-mode resolution logic for the Times Square sidebar tree.
 *
 * Focus state lives in the `ts_nav_focus=<node path>` URL query parameter
 * (part of the reserved `ts_` namespace). These helpers resolve that
 * requested path against the GitHub contents tree and build the hrefs that
 * set, change, and clear focus.
 */

import type { ContentNode } from '@lsst-sqre/times-square-client';

import { getAncestorPaths } from '../../hooks/useTreeExpansion';

/** One segment of the focus breadcrumb. */
export type FocusBreadcrumbItem = {
  title: string;
  path: string;
};

/** Find the node with exactly `path`, or null if the tree has none. */
export function findNodeByPath(
  nodes: ContentNode[],
  path: string
): ContentNode | null {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    const match = findNodeByPath(node.contents, path);
    if (match) {
      return match;
    }
  }
  return null;
}

/**
 * Resolve a requested `ts_nav_focus` path to the container node to focus.
 *
 * Tries the requested path itself, then each path-segment ancestor from
 * deepest to shallowest, returning the first that names a container (owner,
 * repo, or directory) node in the tree. A stale or invalid path therefore
 * focuses the nearest existing ancestor; returns null (full tree) when no
 * segment matches.
 */
export function resolveFocusNode(
  nodes: ContentNode[],
  focusPath: string
): ContentNode | null {
  if (!focusPath) {
    return null;
  }
  const candidates = [focusPath, ...[...getAncestorPaths(focusPath)].reverse()];
  for (const candidate of candidates) {
    const node = findNodeByPath(nodes, candidate);
    if (node && node.node_type !== 'page') {
      return node;
    }
  }
  return null;
}

/**
 * Build the breadcrumb for a resolved focus path: the focused node's
 * ancestor chain (shallowest first) ending with the focused node itself.
 */
export function getFocusBreadcrumb(
  nodes: ContentNode[],
  focusPath: string
): FocusBreadcrumbItem[] {
  const paths = [...getAncestorPaths(focusPath), focusPath];
  const crumbs: FocusBreadcrumbItem[] = [];
  for (const path of paths) {
    const node = findNodeByPath(nodes, path);
    if (node) {
      crumbs.push({ title: node.title, path: node.path });
    }
  }
  return crumbs;
}

/**
 * Build an href with the `ts_nav_focus` parameter set to `focusPath` (or
 * removed when null), preserving every other query parameter in `search`.
 */
export function buildFocusHref(
  pathname: string,
  search: string,
  focusPath: string | null
): string {
  const params = new URLSearchParams(search);
  if (focusPath) {
    params.set('ts_nav_focus', focusPath);
  } else {
    params.delete('ts_nav_focus');
  }
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}
