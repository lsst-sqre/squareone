import getConfig from 'next/config';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';

import TimesSquareApp from '../../../../../../components/TimesSquareApp';
import WideContentLayout from '../../../../../../components/WideContentLayout';
import TimesSquareNotebookViewer from '../../../../../../components/TimesSquareNotebookViewer';
import TimesSquareUrlParametersProvider from '../../../../../../components/TimesSquareUrlParametersProvider';
import TimesSquareHtmlEventsProvider from '../../../../../../components/TimesSquareHtmlEventsProvider/TimesSquareHtmlEventsProvider';

export default function GitHubPrNotebookViewPage() {
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

GitHubPrNotebookViewPage.getLayout = function getLayout(
  page: ReactElement
): ReactNode {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export const getServerSideProps: GetServerSideProps = async () => {
  // Make the page return a 404 if Times Square is not configured
  const { publicRuntimeConfig } = getConfig();
  const notFound = publicRuntimeConfig.timesSquareUrl ? false : true;

  return {
    notFound,
    props: {},
  };
};
