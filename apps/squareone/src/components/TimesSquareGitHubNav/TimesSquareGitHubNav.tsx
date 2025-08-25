/*
 * Show the GitHub file tree for Times Square navigation.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import React from 'react';
import styled from 'styled-components';

import Directory from './Directory';
import Page from './Page';

type ContentNode = {
  node_type: 'owner' | 'repo' | 'dir' | 'page';
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

function generateChildren(
  contents: ContentNode[],
  currentPath: string | null,
  pathRoot: string,
  props: Record<string, any>
): React.ReactNode[] {
  return contents.map((item) => {
    if (item.node_type != 'page') {
      return (
        <Directory
          title={item.title}
          key={item.path}
          current={currentPath ? currentPath.startsWith(item.path) : false}
        >
          {generateChildren(item.contents, currentPath, pathRoot, { ...props })}
        </Directory>
      );
    } else {
      return (
        <Page
          title={item.title}
          path={`${pathRoot}/${item.path}`}
          key={item.path}
          current={currentPath ? currentPath.startsWith(item.path) : false}
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
  const children = generateChildren(contentNodes, pagePath, pagePathRoot, {});

  return (
    <NavWrapper>
      <ContentsWrapper>{children}</ContentsWrapper>
    </NavWrapper>
  );
}

// FIXME these mostly come from Comeau's example
const ContentsWrapper = styled.div`
  --row-height: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  margin-top: -0.25rem;
  line-height: 1.3;
`;

const NavWrapper = styled.nav``;
