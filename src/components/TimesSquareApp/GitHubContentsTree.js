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

function generateChildren(contents, props) {
  return contents.map((item) => {
    if (item.node_type != 'page') {
      return (
        <Directory title={item.title}>
          {generateChildren(item.contents, { ...props })}
        </Directory>
      );
    } else {
      return <Page title={item.title} path={item.path} />;
    }
  });
}

export default function GitHubContentsTree({}) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const githubContents = useGitHubContentsListing(timesSquareUrl);

  const children = generateChildren(githubContents.contents, {});

  if (githubContents) {
    return <ContentsWrapper>{children}</ContentsWrapper>;
  } else {
    return <p>Loading...</p>;
  }
}

// FIXME these mostly come from Comeau's example
const ContentsWrapper = styled.div`
  --row-height: 1.75rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  // overflow: auto;
  padding: 0 16px 0 12px;
  margin-top: -0.25rem;
`;
