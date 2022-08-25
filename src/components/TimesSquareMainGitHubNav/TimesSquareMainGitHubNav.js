import React from 'react';
import getConfig from 'next/config';
import styled from 'styled-components';

import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import useGitHubContentsListing from './useGitHubContentsListing';

function TimesSquareMainGitHubNav({ pagePath }) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const githubContents = useGitHubContentsListing(timesSquareUrl);

  if (githubContents) {
    return (
      <StyledContainer>
        <TimesSquareGitHubNav
          contentNodes={githubContents.contents}
          pagePath={pagePath}
          pagePathRoot="/times-square/github"
        />
      </StyledContainer>
    );
  }
}

export default TimesSquareMainGitHubNav;

const StyledContainer = styled.div`
  margin-top: 2rem;
`;
