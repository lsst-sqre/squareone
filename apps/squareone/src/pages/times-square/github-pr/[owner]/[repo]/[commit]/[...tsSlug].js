import getConfig from 'next/config';
import { useRouter } from 'next/router';

import TimesSquareApp from '../../../../../../components/TimesSquareApp';
import WideContentLayout from '../../../../../../components/WideContentLayout';
import TimesSquarePrGitHubNav from '../../../../../../components/TimesSquarePrGitHubNav';
import TimesSquareNotebookViewer from '../../../../../../components/TimesSquareNotebookViewer';
import TimesSquareGitHubPagePanel from '../../../../../../components/TimesSquareGitHubPagePanel/TimesSquareGitHubPagePanel';
import TimesSquareParametersProvider from '../../../../../../components/TimesSquareParametersProvider';

export default function GitHubPrNotebookViewPage({}) {
  const router = useRouter();
  const { owner, repo, commit } = router.query;

  const pageNav = (
    <TimesSquarePrGitHubNav owner={owner} repo={repo} commitSha={commit} />
  );

  const pagePanel = <TimesSquareGitHubPagePanel />;

  return (
    <TimesSquareParametersProvider>
      <TimesSquareApp pageNav={pageNav} pagePanel={pagePanel}>
        <TimesSquareNotebookViewer />
      </TimesSquareApp>
    </TimesSquareParametersProvider>
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
