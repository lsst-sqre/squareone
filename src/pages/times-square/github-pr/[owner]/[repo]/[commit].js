import React from 'react';
import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import TimesSquareApp from '../../../../../components/TimesSquareApp';
import TimesSquarePrGitHubNav from '../../../../../components/TimesSquarePrGitHubNav';
import WideContentLayout from '../../../../../components/WideContentLayout';
import useGitHubPrContentsListing from '../../../../../components/TimesSquarePrGitHubNav/useGitHubPrContentsListing';

export default function GitHubPrLandingPage({}) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const router = useRouter();
  const { owner, repo, commit } = router.query;

  const githubContents = useGitHubPrContentsListing(
    timesSquareUrl,
    owner,
    repo,
    commit
  );

  const pageNav = (
    <TimesSquarePrGitHubNav
      owner={owner}
      repo={repo}
      commitSha={commit}
      showPrDetails={false}
    />
  );

  let prDetails;
  if (!(githubContents.loading || githubContents.error)) {
    const { nbCheck, yamlCheck } = githubContents;
    prDetails = (
      <>
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

      <h1>Pull Request Preview for {`${owner}/${repo} at ${commit}`}</h1>
      {prDetails}
    </TimesSquareApp>
  );
}

GitHubPrLandingPage.getLayout = function getLayout(page) {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();

  // Make the page return a 404 if Times Square is not configured
  const notFound = publicRuntimeConfig.timesSquareUrl ? false : true;

  return {
    notFound,
    props: {},
  };
}
