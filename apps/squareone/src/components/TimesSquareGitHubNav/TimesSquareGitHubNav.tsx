/*
 * Show the GitHub file tree for Times Square navigation.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

'use client';

import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import React, { useMemo } from 'react';

import type { TreeExpansion } from '../../hooks/useTreeExpansion';
import { useTreeExpansion } from '../../hooks/useTreeExpansion';
import Directory from './Directory';
import Page from './Page';
import styles from './TimesSquareGitHubNav.module.css';

type ContentNode = {
  node_type: 'owner' | 'repo' | 'directory' | 'page';
  title: string;
  path: string;
  contents: ContentNode[];
};

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
  expansion: TreeExpansion
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
          {generateChildren(item.contents, currentPath, pathRoot, expansion)}
        </Directory>
      );
    } else {
      return (
        <Page
          title={item.title}
          path={`${pathRoot}/${item.path}`}
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
}: TimesSquareGitHubNavProps) {
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
    contentNodes,
    pagePath,
    pagePathRoot,
    expansion
  );

  return (
    <nav>
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
