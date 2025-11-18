import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';

import TimesSquareApp from '../../../components/TimesSquareApp';
import TimesSquareHtmlEventsProvider from '../../../components/TimesSquareHtmlEventsProvider/TimesSquareHtmlEventsProvider';
import TimesSquareNotebookViewer from '../../../components/TimesSquareNotebookViewer';
import TimesSquareUrlParametersProvider from '../../../components/TimesSquareUrlParametersProvider';
import WideContentLayout from '../../../components/WideContentLayout';
import { loadAppConfig } from '../../../lib/config/loader';

// biome-ignore lint/complexity/noBannedTypes: Empty props object required for Next.js page
type GitHubNotebookViewPageProps = {};

export default function GitHubNotebookViewPage() {
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

GitHubNotebookViewPage.getLayout = function getLayout(
  page: ReactElement
): ReactNode {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export const getServerSideProps: GetServerSideProps<
  GitHubNotebookViewPageProps
> = async () => {
  try {
    const appConfig = await loadAppConfig();

    // Make the page return a 404 if Times Square is not configured
    const notFound = !appConfig.timesSquareUrl;

    return {
      notFound,
      props: {
        appConfig,
      },
    };
  } catch (error) {
    console.error(
      'Failed to load configuration for Times Square GitHub page:',
      error
    );

    // Return 404 if configuration loading fails
    return {
      notFound: true,
    };
  }
};
