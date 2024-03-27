import getConfig from 'next/config';
import { useRouter } from 'next/router';

import TimesSquareApp from '../../../components/TimesSquareApp';
import WideContentLayout from '../../../components/WideContentLayout';
import TimesSquareMainGitHubNav from '../../../components/TimesSquareMainGitHubNav';
import TimesSquareNotebookViewer from '../../../components/TimesSquareNotebookViewer';
import TimesSquareGitHubPagePanel from '../../../components/TimesSquareGitHubPagePanel/TimesSquareGitHubPagePanel';
import TimesSquareParametersProvider from '../../../components/TimesSquareParametersProvider';

export default function GitHubNotebookViewPage({}) {
  const router = useRouter();
  const { tsSlug } = router.query;
  const githubSlug = tsSlug.join('/');

  const pageNav = <TimesSquareMainGitHubNav pagePath={githubSlug} />;

  return (
    <TimesSquareParametersProvider>
      <TimesSquareApp
        pageNav={pageNav}
        pagePanel={<TimesSquareGitHubPagePanel />}
      >
        <TimesSquareNotebookViewer />
      </TimesSquareApp>
    </TimesSquareParametersProvider>
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
