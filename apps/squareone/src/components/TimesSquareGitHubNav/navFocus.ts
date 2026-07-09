/*
 * Focus-mode resolution logic for the Times Square sidebar tree.
 *
 * Focus state lives in the `ts_nav_focus=<node path>` URL query parameter
 * (part of the reserved `ts_` namespace). These helpers resolve that
 * requested path against the GitHub contents tree and build the hrefs that
 * set, change, and clear focus.
 */

import type { ContentNode } from '@lsst-sqre/times-square-client';

/** One segment of the focus breadcrumb. */
export type FocusBreadcrumbItem = {
  title: string;
  path: string;
};

/**
 * A resolved focus: the container node to focus plus its ancestor node chain
 * (root-first, excluding the focused node itself). The ancestor chain IS the
 * breadcrumb prefix — append the focused node to render the full breadcrumb.
 */
export type ResolvedFocus = {
  node: ContentNode;
  ancestors: ContentNode[];
};

/**
 * Resolve a requested `ts_nav_focus` path to the container node to focus and
 * its ancestor chain, walking the tree once.
 *
 * Times Square node paths nest by slash segments mirroring the tree, so a
 * single top-down walk consumes the focus path segment by segment: at each
 * level it descends into the child whose path matches the next prefix,
 * recording each container (owner, repo, or directory) node it passes through.
 * The deepest existing container along that path becomes the focused node and
 * the containers above it become its ancestors.
 *
 * Behavior:
 * - An exact container path resolves to that node (with its ancestors).
 * - A page path resolves to its containing directory (pages are not
 *   focusable), i.e. the deepest container above the page.
 * - A stale or invalid path resolves to the nearest existing container
 *   ancestor.
 * - Returns null (full tree, no breadcrumb) when no path segment matches, or
 *   for an empty focus path.
 *
 * Matching is segment-aware, so a sibling sharing only a string prefix (e.g.
 * `weather` vs `weather-archive`) is never mistaken for an ancestor.
 */
export function resolveFocus(
  nodes: ContentNode[],
  focusPath: string
): ResolvedFocus | null {
  if (!focusPath) {
    return null;
  }

  const chain: ContentNode[] = [];
  let level: ContentNode[] = nodes;

  // Descend one path segment (one tree level) at a time. `prefix` is the full
  // slash path of the node we expect at the current level.
  const segments = focusPath.split('/');
  for (let i = 0; i < segments.length; i += 1) {
    const prefix = segments.slice(0, i + 1).join('/');
    const match = level.find((node) => node.path === prefix);
    if (!match) {
      break;
    }
    // Pages are not focusable, so stop descending at a page: the deepest
    // container recorded so far is the focused node.
    if (match.node_type === 'page') {
      break;
    }
    chain.push(match);
    level = match.contents;
  }

  if (chain.length === 0) {
    return null;
  }

  const node = chain[chain.length - 1];
  const ancestors = chain.slice(0, -1);
  return { node, ancestors };
}

/**
 * Build the breadcrumb for a resolved focus: the focused node's ancestor chain
 * (root-first) ending with the focused node itself.
 */
export function getFocusBreadcrumb(
  resolved: ResolvedFocus
): FocusBreadcrumbItem[] {
  return [...resolved.ancestors, resolved.node].map((node) => ({
    title: node.title,
    path: node.path,
  }));
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
