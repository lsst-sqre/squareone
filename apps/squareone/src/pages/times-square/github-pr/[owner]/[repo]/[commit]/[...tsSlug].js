import getConfig from 'next/config';

import TimesSquareApp from '../../../../../../components/TimesSquareApp';
import WideContentLayout from '../../../../../../components/WideContentLayout';
import TimesSquareNotebookViewer from '../../../../../../components/TimesSquareNotebookViewer';
import TimesSquareUrlParametersProvider from '../../../../../../components/TimesSquareUrlParametersProvider';

export default function GitHubPrNotebookViewPage({}) {
  return (
    <TimesSquareUrlParametersProvider>
      <TimesSquareApp>
        <TimesSquareNotebookViewer />
      </TimesSquareApp>
    </TimesSquareUrlParametersProvider>
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
