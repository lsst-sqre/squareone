import React from 'react';

import getConfig from 'next/config';

import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import useGitHubPrContentsListing from './useGitHubPrContentsListing';

function TimesSquarePrGitHubNav({ owner, repo, commitSha }) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const githubContents = useGitHubPrContentsListing(
    timesSquareUrl,
    owner,
    repo,
    commitSha
  );

  console.log(githubContents);

  if (githubContents) {
    return (
      <>
        <h2>PR preview</h2>
        <p>
          <a href="{`https://github.com/${owner}/${repo}/`}">{`${owner}/${repo}`}</a>
        </p>
        <p>{commitSha.slice(0, 7)}</p>
        <h3>Repository notebooks</h3>
        <TimesSquareGitHubNav contentNodes={githubContents.contents} />
      </>
    );
  }
}

export default TimesSquarePrGitHubNav;
