import getConfig from 'next/config';
import { useRouter } from 'next/router';

import TimesSquareApp from '../../../../../../components/TimesSquareApp';
import WideContentLayout from '../../../../../../components/WideContentLayout';
import TimesSquarePrGitHubNav from '../../../../../../components/TimesSquarePrGitHubNav';
import TimesSquareNotebookViewer from '../../../../../../components/TimesSquareNotebookViewer';
import TimesSquareGitHubPagePanel from '../../../../../../components/TimesSquareGitHubPagePanel/TimesSquareGitHubPagePanel';

export function TimesSquareGitHubPrNav({ pagePath }) {
  return <div>Nav component</div>;
}

export default function GitHubPrNotebookViewPage({}) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const router = useRouter();
  const { owner, repo, commit, tsSlug } = router.query;
  const tsPageUrl = `${timesSquareUrl}/v1/github-pr/${owner}/${repo}/${commit}/${tsSlug.join(
    '/'
  )}`;

  const userParameters = Object.fromEntries(
    Object.entries(router.query)
      .filter((item) => item[0] != 'tsSlug')
      .map((item) => item)
  );

  const { ts_hide_code = '1' } = userParameters;
  const displaySettings = { ts_hide_code };

  const pageNav = (
    <TimesSquarePrGitHubNav owner={owner} repo={repo} commitSha={commit} />
  );

  const pagePanel = (
    <TimesSquareGitHubPagePanel
      tsPageUrl={tsPageUrl}
      userParameters={userParameters}
      displaySettings={displaySettings}
    />
  );

  return (
    <TimesSquareApp pageNav={pageNav} pagePanel={pagePanel}>
      <TimesSquareNotebookViewer
        tsPageUrl={tsPageUrl}
        parameters={userParameters}
        displaySettings={displaySettings}
      />
    </TimesSquareApp>
  );
}

GitHubPrNotebookViewPage.getLayout = function getLayout(page) {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export async function getServerSideProps() {
  // Make the page return a 404 if Times Square is not configured
  const { publicRuntimeConfig } = getConfig();
  const notFound = publicRuntimeConfig.timesSquareUrl ? false : true;

  return {
    notFound,
    props: {},
  };
}
