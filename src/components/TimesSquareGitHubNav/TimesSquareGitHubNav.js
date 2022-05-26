/*
 * Show the GitHub file tree for Times Square navigation.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import styled from 'styled-components';
import getConfig from 'next/config';

import Directory from './Directory';
import Page from './Page';
import useGitHubContentsListing from './useGitHubContentsListing';

function generateChildren(contents, currentPath, props) {
  return contents.map((item) => {
    if (item.node_type != 'page') {
      return (
        <Directory
          title={item.title}
          key={item.path}
          current={currentPath ? currentPath.startsWith(item.path) : false}
        >
          {generateChildren(item.contents, currentPath, { ...props })}
        </Directory>
      );
    } else {
      return (
        <Page
          title={item.title}
          path={item.path}
          key={item.path}
          current={currentPath ? currentPath.startsWith(item.path) : false}
        />
      );
    }
  });
}

export default function TimesSquareGitHubNav({ pagePath }) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const githubContents = useGitHubContentsListing(timesSquareUrl);

  const children = generateChildren(githubContents.contents, pagePath, {});

  if (githubContents) {
    return (
      <NavWrapper>
        <SectionTitle>Rubin’s boards</SectionTitle>
        <ContentsWrapper>{children}</ContentsWrapper>
      </NavWrapper>
    );
  } else {
    return (
      <NavWrapper>
        <SectionTitle>Rubin’s boards</SectionTitle>
        <p>Loading...</p>
      </NavWrapper>
    );
  }
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

const SectionTitle = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--rsd-component-text-headline-color);
`;
