/*
 * Show the GitHub file tree for Times Square navigation.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

'use client';

import { ChevronsDownUp, ChevronsUpDown, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';

import type { TreeExpansion } from '../../hooks/useTreeExpansion';
import { useTreeExpansion } from '../../hooks/useTreeExpansion';
import Directory from './Directory';
import type { ContentNode } from './navFocus';
import {
  buildFocusHref,
  getFocusBreadcrumb,
  resolveFocusNode,
} from './navFocus';
import Page from './Page';
import styles from './TimesSquareGitHubNav.module.css';

type TimesSquareGitHubNavProps = {
  /**
   * GitHub contents tree.
   */
  contentNodes: ContentNode[];
  /**
   * Root URL path for pages
   */
  pagePathRoot: '/times-square/github' | '/times-square/github-pr';
  /**
   * Path of the current page (or null if not on a page)
   */
  pagePath: string | null;
  /**
   * Requested focus path from the `ts_nav_focus` URL parameter (main tree
   * only). When it resolves to a node in the tree, that node renders as the
   * tree root beneath a breadcrumb; a stale path resolves to its nearest
   * existing ancestor. Null or unresolvable renders the full tree.
   */
  focusPath?: string | null;
};

/**
 * Whether `nodePath` is the current page or a path-segment ancestor of it.
 *
 * Segment-aware so sibling paths sharing a string prefix (e.g. `weather` and
 * `weather-archive`) are not both marked current.
 */
function isCurrentPath(currentPath: string | null, nodePath: string): boolean {
  if (!currentPath) {
    return false;
  }
  return currentPath === nodePath || currentPath.startsWith(`${nodePath}/`);
}

/** Collect the paths of every container (non-page) node in the tree. */
function collectContainerPaths(contents: ContentNode[]): string[] {
  const paths: string[] = [];
  const visit = (nodes: ContentNode[]) => {
    for (const node of nodes) {
      if (node.node_type !== 'page') {
        paths.push(node.path);
        visit(node.contents);
      }
    }
  };
  visit(contents);
  return paths;
}

function generateChildren(
  contents: ContentNode[],
  currentPath: string | null,
  pathRoot: string,
  expansion: TreeExpansion,
  focusPath: string | null
): React.ReactNode[] {
  return contents.map((item) => {
    if (item.node_type !== 'page') {
      return (
        <Directory
          title={item.title}
          nodeType={item.node_type}
          key={item.path}
          current={isCurrentPath(currentPath, item.path)}
          expanded={expansion.isExpanded(item.path)}
          onToggle={() => expansion.toggle(item.path)}
        >
          {generateChildren(
            item.contents,
            currentPath,
            pathRoot,
            expansion,
            focusPath
          )}
        </Directory>
      );
    } else {
      return (
        <Page
          title={item.title}
          path={buildFocusHref(`${pathRoot}/${item.path}`, '', focusPath)}
          key={item.path}
          current={isCurrentPath(currentPath, item.path)}
        />
      );
    }
  });
}

export default function TimesSquareGitHubNav({
  pagePath,
  contentNodes,
  pagePathRoot,
  focusPath = null,
}: TimesSquareGitHubNavProps) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? '';

  // Resolve the requested focus path against the tree: an exact container
  // match, else the nearest existing ancestor, else null (full tree).
  const focusedNode = useMemo(
    () => (focusPath ? resolveFocusNode(contentNodes, focusPath) : null),
    [contentNodes, focusPath]
  );
  const breadcrumb = useMemo(
    () =>
      focusedNode ? getFocusBreadcrumb(contentNodes, focusedNode.path) : [],
    [contentNodes, focusedNode]
  );
  const visibleNodes = focusedNode ? [focusedNode] : contentNodes;

  const allPaths = useMemo(
    () => collectContainerPaths(contentNodes),
    [contentNodes]
  );
  const expansion = useTreeExpansion({
    allPaths,
    currentPath: pagePath,
    storageKey: `times-square-github-nav:${pagePathRoot}`,
  });
  const children = generateChildren(
    visibleNodes,
    pagePath,
    pagePathRoot,
    expansion,
    focusedNode ? focusedNode.path : null
  );

  return (
    <nav>
      {focusedNode && (
        <div className={styles.breadcrumb}>
          <ol className={styles.breadcrumbList} aria-label="Focus breadcrumb">
            {breadcrumb.map((crumb, index) => (
              <li
                key={crumb.path}
                className={styles.breadcrumbItem}
                aria-current={
                  index === breadcrumb.length - 1 ? 'location' : undefined
                }
              >
                {index === breadcrumb.length - 1 ? (
                  crumb.title
                ) : (
                  <Link href={buildFocusHref(pathname, search, crumb.path)}>
                    {crumb.title}
                  </Link>
                )}
              </li>
            ))}
          </ol>
          <Link
            href={buildFocusHref(pathname, search, null)}
            className={styles.breadcrumbClear}
            aria-label="Clear focus"
            title="Clear focus"
          >
            <X className={styles.toolbarIcon} aria-hidden />
          </Link>
        </div>
      )}
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={expansion.expandAll}
          aria-label="Expand all"
          title="Expand all"
        >
          <ChevronsUpDown className={styles.toolbarIcon} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={expansion.collapseAll}
          aria-label="Collapse all"
          title="Collapse all"
        >
          <ChevronsDownUp className={styles.toolbarIcon} aria-hidden />
        </button>
      </div>
      <div className={styles.contentsWrapper}>{children}</div>
    </nav>
  );
}
