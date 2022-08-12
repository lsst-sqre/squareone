import React from 'react';
import getConfig from 'next/config';

import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import useGitHubContentsListing from './useGitHubContentsListing';

function TimesSquareMainGitHubNav({ pagePath }) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const githubContents = useGitHubContentsListing(timesSquareUrl);

  console.log(githubContents);

  if (githubContents) {
    return (
      <TimesSquareGitHubNav
        contentNodes={githubContents.contents}
        pagePath={pagePath}
      />
    );
  }
}

export default TimesSquareMainGitHubNav;
