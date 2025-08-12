import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import TimesSquareApp from '../../../../../components/TimesSquareApp';
import TimesSquarePrGitHubNav from '../../../../../components/TimesSquarePrGitHubNav';
import WideContentLayout from '../../../../../components/WideContentLayout';
import useGitHubPrContentsListing from '../../../../../components/TimesSquarePrGitHubNav/useGitHubPrContentsListing';
import GitHubCheckBadge from '../../../../../components/TimesSquarePrGitHubNav/GitHubCheckBadge';
import GitHubPrBadge from '../../../../../components/TimesSquarePrGitHubNav/GitHubPrBadge';

export default function GitHubPrLandingPage() {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const router = useRouter();
  const { owner, repo, commit } = router.query;

  const githubContents = useGitHubPrContentsListing(
    timesSquareUrl,
    Array.isArray(owner) ? owner[0] : owner,
    Array.isArray(repo) ? repo[0] : repo,
    Array.isArray(commit) ? commit[0] : commit
  );

  const pageNav = (
    <TimesSquarePrGitHubNav
      owner={Array.isArray(owner) ? owner[0] : owner}
      repo={Array.isArray(repo) ? repo[0] : repo}
      commitSha={Array.isArray(commit) ? commit[0] : commit}
      showPrDetails={false}
    />
  );

  let prDetails;
  if (!(githubContents.loading || githubContents.error)) {
    const { nbCheck, yamlCheck } = githubContents;
    prDetails = (
      <>
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
    );
  } else {
    prDetails = <></>;
  }

  return (
    <TimesSquareApp pageNav={pageNav}>
      <Head>
        <title>
          Pull Request Preview{' '}
          {`${owner}/${repo} ${commit} | ${publicRuntimeConfig.siteName}`}
        </title>
      </Head>

      <StyledHeader>
        <p className="subtitle">Pull Request Preview</p>
        <h1>
          {`${Array.isArray(owner) ? owner[0] : owner}/${
            Array.isArray(repo) ? repo[0] : repo
          }`}{' '}
          <CommitSpan>
            <FontAwesomeIcon icon="code-commit" />{' '}
            {(Array.isArray(commit) ? commit[0] : commit || '').slice(0, 7)}
          </CommitSpan>
        </h1>
      </StyledHeader>

      {prDetails}
    </TimesSquareApp>
  );
}

GitHubPrLandingPage.getLayout = function getLayout(
  page: ReactElement
): ReactNode {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { publicRuntimeConfig } = getConfig();

  // Make the page return a 404 if Times Square is not configured
  const notFound = publicRuntimeConfig.timesSquareUrl ? false : true;

  return {
    notFound,
    props: {},
  };
};

const StyledHeader = styled.header`
  .subtitle {
    font-size: 1.2rem;
    color: var(--rsd-component-text-color);
    text-transform: uppercase;
    font-weight: bold;
  }
`;

const CommitSpan = styled.span`
  display: inline-block;

  .commit-icon {
    margin-right: 0.2rem;
  }
`;

const ItemList = styled.ul`
  list-style: none;
  margin: 1rem 0 1rem;
  padding-left: 0;
`;
