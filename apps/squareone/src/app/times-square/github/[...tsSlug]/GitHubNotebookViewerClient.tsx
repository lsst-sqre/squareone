'use client';

import TimesSquareApp from '../../../../components/TimesSquareApp';
import TimesSquareHtmlEventsProvider from '../../../../components/TimesSquareHtmlEventsProvider/TimesSquareHtmlEventsProvider';
import TimesSquareNotebookViewer from '../../../../components/TimesSquareNotebookViewer';

/**
 * Client component for GitHub notebook viewer.
 *
 * Wraps the notebook viewer with:
 * - TimesSquareHtmlEventsProvider for SSE updates on execution status
 * - TimesSquareApp for the Times Square layout with sidebar navigation
 * - TimesSquareNotebookViewer for rendering the notebook content
 */
export default function GitHubNotebookViewerClient() {
  return (
    <TimesSquareHtmlEventsProvider>
      <TimesSquareApp>
        <TimesSquareNotebookViewer />
      </TimesSquareApp>
    </TimesSquareHtmlEventsProvider>
  );
}
