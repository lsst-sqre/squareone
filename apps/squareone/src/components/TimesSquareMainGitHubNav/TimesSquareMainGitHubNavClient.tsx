/*
 * Client-only TimesSquareMainGitHubNav component - uses SWR without SSR conflicts
 * This component handles the useGitHubContentsListing hook on the client side only.
 */

import React, { useState, useEffect } from 'react';
import getConfig from 'next/config';
import styled from 'styled-components';

import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import useGitHubContentsListing from './useGitHubContentsListing';

type TimesSquareMainGitHubNavClientProps = {
  pagePath: string;
};

function TimesSquareMainGitHubNavClient({
  pagePath,
}: TimesSquareMainGitHubNavClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const githubContents = useGitHubContentsListing(timesSquareUrl);

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  if (!githubContents) {
    return null;
  }

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

export default TimesSquareMainGitHubNavClient;

const StyledContainer = styled.div`
  margin-top: 2rem;
`;
