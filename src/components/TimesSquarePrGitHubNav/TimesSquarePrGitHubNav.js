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

  if (!(githubContents.loading || githubContents.error)) {
    const { nbCheck, yamlCheck } = githubContents;
    console.log(nbCheck);
    console.log(yamlCheck);
    return (
      <>
        <h2>PR preview</h2>
        <p>
          <a
            href={`https://github.com/${owner}/${repo}/`}
          >{`${owner}/${repo}`}</a>
        </p>
        <p>{commitSha.slice(0, 7)}</p>
        {githubContents.pullRequests.map((pr) => (
          <p key={`pr-${pr.number}`}>
            <a
              href={pr.conversation_url}
            >{`PR#${pr.number} (${pr.state}) ${pr.title}`}</a>{' '}
            by <a href={pr.contributor.html_url}>{pr.contributor.username}</a>
          </p>
        ))}
        <p>{`${nbCheck.name}: ${nbCheck.conclusion || nbCheck.status}`}</p>
        <p>{`${yamlCheck.name}: ${
          yamlCheck.conclusion || yamlCheck.status
        }`}</p>
        <h3>Notebooks</h3>
        <TimesSquareGitHubNav
          contentNodes={githubContents.contents}
          pagePathRoot="/times-square/github-pr"
        />
      </>
    );
  }

  return null; // still loading
}

export default TimesSquarePrGitHubNav;
