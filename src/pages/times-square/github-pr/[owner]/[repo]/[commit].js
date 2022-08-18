import React from 'react';
import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import TimesSquareApp from '../../../../../components/TimesSquareApp';
import TimesSquarePrGitHubNav from '../../../../../components/TimesSquarePrGitHubNav';
import WideContentLayout from '../../../../../components/WideContentLayout';

export default function GitHubPrLandingPage({}) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const router = useRouter();
  const { owner, repo, commit } = router.query;

  const pageNav = (
    <TimesSquarePrGitHubNav owner={owner} repo={repo} commitSha={commit} />
  );

  return (
    <TimesSquareApp pageNav={pageNav}>
      <Head>
        <title>
          Pull Request Preview{' '}
          {`${owner}/${repo} ${commit} | ${publicRuntimeConfig.siteName}`}
        </title>
      </Head>

      <h1>Pull Request Preview for {`${owner}/${repo} at ${commit}`}</h1>
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
