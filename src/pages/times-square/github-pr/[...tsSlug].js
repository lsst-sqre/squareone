import getConfig from 'next/config';
import { useRouter } from 'next/router';

import TimesSquareApp from '../../../components/TimesSquareApp';
import WideContentLayout from '../../../components/WideContentLayout';
import TimesSquareGitHubNav from '../../../components/TimesSquareGitHubNav';
import TimesSquareNotebookViewer from '../../../components/TimesSquareNotebookViewer';
import TimesSquareGitHubPagePanel from '../../../components/TimesSquareGitHubPagePanel/TimesSquareGitHubPagePanel';

export function TimesSquareGitHubPrNav({ pagePath }) {
  return <div>Nav component</div>;
}

export default function GitHubPrNotebookViewPage({}) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const router = useRouter();
  const { tsSlug } = router.query;
  const githubSlug = tsSlug.join('/');
  const tsPageUrl = `${timesSquareUrl}/v1/github-pr/${githubSlug}`;

  const userParameters = Object.fromEntries(
    Object.entries(router.query)
      .filter((item) => item[0] != 'tsSlug')
      .map((item) => item)
  );

  const { ts_hide_code = '1' } = userParameters;
  const displaySettings = { ts_hide_code };

  const pageNav = <TimesSquareGitHubPrNav pagePath={githubSlug} />;

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
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

  // Make the page return a 404 if Times Square is not configured
  const { publicRuntimeConfig } = getConfig();
  const notFound = publicRuntimeConfig.timesSquareUrl ? false : true;

  return {
    notFound,
    props: {},
  };
}
