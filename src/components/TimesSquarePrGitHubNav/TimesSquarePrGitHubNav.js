import React from 'react';
import styled from 'styled-components';
import getConfig from 'next/config';

import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import useGitHubPrContentsListing from './useGitHubPrContentsListing';
import GitHubPrTitle from './GitHubPrTitle';
import GitHubPrBadge from './GitHubPrBadge';
import GitHubCheckBadge from './GitHubCheckBadge';

function TimesSquarePrGitHubNav({
  owner,
  repo,
  commitSha,
  showPrDetails = true,
}) {
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

    return (
      <section>
        {showPrDetails && (
          <>
            <GitHubPrTitle owner={owner} repo={repo} commit={commitSha} />

            {githubContents.pullRequests.map((pr) => (
              <GitHubPrBadge
                key={`pr-${pr.number}`}
                state={pr.state}
                number={pr.number}
                url={pr.conversation_url}
                title={pr.title}
                authorName={pr.contributor.username}
                authorAvatarUrl={pr.contributor.avatar_url}
                authorUrl={pr.contributor.html_url}
              />
            ))}

            <CheckList>
              {nbCheck && (
                <li>
                  <GitHubCheckBadge
                    status={nbCheck.status}
                    title={nbCheck.report_title}
                    conclusion={nbCheck.conclusion}
                    url={nbCheck.html_url}
                  />
                </li>
              )}
              {yamlCheck && (
                <li>
                  <GitHubCheckBadge
                    status={yamlCheck.status}
                    title={yamlCheck.report_title}
                    conclusion={yamlCheck.conclusion}
                    url={yamlCheck.html_url}
                  />
                </li>
              )}
            </CheckList>
          </>
        )}

        <h3>Notebooks</h3>
        <TimesSquareGitHubNav
          contentNodes={githubContents.contents}
          pagePathRoot="/times-square/github-pr"
        />
      </section>
    );
  }

  return null; // still loading
}

export default TimesSquarePrGitHubNav;

const CheckList = styled.ul`
  list-style: none;
  margin-left: 0;
`;
