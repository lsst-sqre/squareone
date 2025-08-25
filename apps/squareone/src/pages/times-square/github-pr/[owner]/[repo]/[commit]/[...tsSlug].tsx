import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';

import TimesSquareApp from '../../../../../../components/TimesSquareApp';
import WideContentLayout from '../../../../../../components/WideContentLayout';
import TimesSquareNotebookViewer from '../../../../../../components/TimesSquareNotebookViewer';
import TimesSquareUrlParametersProvider from '../../../../../../components/TimesSquareUrlParametersProvider';
import TimesSquareHtmlEventsProvider from '../../../../../../components/TimesSquareHtmlEventsProvider/TimesSquareHtmlEventsProvider';
import { loadAppConfig } from '../../../../../../lib/config/loader';
import type { AppConfigContextValue } from '../../../../../../contexts/AppConfigContext';

type GitHubPrNotebookViewPageProps = {
  appConfig: AppConfigContextValue;
};

export default function GitHubPrNotebookViewPage({}: GitHubPrNotebookViewPageProps) {
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

export const getServerSideProps: GetServerSideProps<
  GitHubPrNotebookViewPageProps
> = async () => {
  try {
    const appConfig = await loadAppConfig();

    // Make the page return a 404 if Times Square is not configured
    const notFound = appConfig.timesSquareUrl ? false : true;

    return {
      notFound,
      props: {
        appConfig,
      },
    };
  } catch (error) {
    console.error(
      'Failed to load configuration for Times Square GitHub PR page:',
      error
    );

    // Return 404 if configuration loading fails
    return {
      notFound: true,
    };
  }
};
