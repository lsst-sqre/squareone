/*
 * Client-only TimesSquarePrGitHubNav component - uses SWR without SSR conflicts
 * This component handles the useGitHubPrContentsListing hook on the client side only.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import getConfig from 'next/config';

import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import useGitHubPrContentsListing from './useGitHubPrContentsListing';
import GitHubPrTitle from './GitHubPrTitle';
import GitHubPrBadge from './GitHubPrBadge';
import GitHubCheckBadge from './GitHubCheckBadge';

type TimesSquarePrGitHubNavClientProps = {
  owner: string;
  repo: string;
  commitSha: string;
  showPrDetails?: boolean;
};

function TimesSquarePrGitHubNavClient({
  owner,
  repo,
  commitSha,
  showPrDetails = true,
}: TimesSquarePrGitHubNavClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const githubContents = useGitHubPrContentsListing(
    timesSquareUrl,
    owner,
    repo,
    commitSha
  );

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  if (!(githubContents.loading || githubContents.error)) {
    const { nbCheck, yamlCheck } = githubContents;

    return (
      <StyledSection>
        {showPrDetails && (
          <>
            <GitHubPrTitle owner={owner} repo={repo} commit={commitSha} />

            <ItemList>
              {githubContents.pullRequests.map((pr) => (
                <li key={`pr-${pr.number}`}>
                  <GitHubPrBadge
                    state={pr.state}
                    number={pr.number}
                    url={pr.conversation_url}
                    title={pr.title}
                    authorName={pr.contributor.username}
                    authorAvatarUrl={pr.contributor.avatar_url}
                    authorUrl={pr.contributor.html_url}
                  />
                </li>
              ))}
            </ItemList>

            <ItemList>
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
            </ItemList>
          </>
        )}

        <h3>Notebooks</h3>
        <TimesSquareGitHubNav
          contentNodes={githubContents.contents}
          pagePathRoot="/times-square/github-pr"
          pagePath={null}
        />
      </StyledSection>
    );
  }

  return null; // still loading
}

export default TimesSquarePrGitHubNavClient;

const ItemList = styled.ul`
  list-style: none;
  margin: 1rem 0 1rem;
  padding-left: 0;
`;

const StyledSection = styled.section`
  margin-top: 2rem;
`;
