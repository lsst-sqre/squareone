import styled from 'styled-components';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import TimesSquareApp from '../../../components/TimesSquareApp';
import TimesSquarePage from '../../../components/TimesSquarePage';
import WideContentLayout from '../../../components/WideContentLayout';
import TimesSquareGitHubNav from '../../../components/TimesSquareGitHubNav';

export default function GitHubNotebookViewPage({}) {
  const router = useRouter();
  const { tsSlug } = router.query;

  const userParameters = Object.fromEntries(
    Object.entries(router.query)
      .filter((item) => item[0] != 'tsSlug')
      .map((item) => item)
  );

  const githubSlug = tsSlug.join('/');

  const pageNav = <TimesSquareGitHubNav pagePath={githubSlug} />;

  return (
    <TimesSquareApp pageNav={pageNav}>
      <TimesSquarePage
        githubSlug={githubSlug}
        userParameters={userParameters}
      />
    </TimesSquareApp>
  );
}

GitHubNotebookViewPage.getLayout = function getLayout(page) {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

  // Make the page return a 404 if Times Square is not configured
  const notFound = publicRuntimeConfig.timesSquareUrl ? false : true;

  return {
    notFound,
    props: {},
  };
}
