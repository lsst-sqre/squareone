import getConfig from 'next/config';

import TimesSquareApp from '../../../components/TimesSquareApp';
import WideContentLayout from '../../../components/WideContentLayout';
import TimesSquareNotebookViewer from '../../../components/TimesSquareNotebookViewer';
import TimesSquareUrlParametersProvider from '../../../components/TimesSquareUrlParametersProvider';
import TimesSquareHtmlEventsProvider from '../../../components/TimesSquareHtmlEventsProvider/TimesSquareHtmlEventsProvider';

export default function GitHubNotebookViewPage({}) {
  return (
    <TimesSquareUrlParametersProvider>
      <TimesSquareHtmlEventsProvider>
        <TimesSquareApp>
          <TimesSquareNotebookViewer />
        </TimesSquareApp>
      </TimesSquareHtmlEventsProvider>
    </TimesSquareUrlParametersProvider>
  );
}

GitHubNotebookViewPage.getLayout = function getLayout(page) {
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
