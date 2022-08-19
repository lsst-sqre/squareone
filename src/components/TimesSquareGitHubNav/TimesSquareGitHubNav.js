/*
 * Show the GitHub file tree for Times Square navigation.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import styled from 'styled-components';

import Directory from './Directory';
import Page from './Page';

function generateChildren(contents, currentPath, pathRoot, { ...props }) {
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
}) {
  const children = generateChildren(contentNodes, pagePath, pagePathRoot, {});

  return (
    <NavWrapper>
      <ContentsWrapper>{children}</ContentsWrapper>
    </NavWrapper>
  );
}

// FIXME these mostly come from Comeau's example
const ContentsWrapper = styled.div`
  --row-height: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 16px 0 12px;
  margin-top: -0.25rem;
`;

const NavWrapper = styled.nav``;
