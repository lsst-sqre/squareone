/*
 * TimesSquareNotebookViewer with dynamic import to prevent SSR issues
 * Uses client-only component to handle SWR hooks safely.
 */

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to prevent SWR hook issues
const TimesSquareNotebookViewerClient = dynamic(
  () => import('./TimesSquareNotebookViewerClient'),
  {
    ssr: false,
    loading: () => (
      <div>
        <p>Loading...</p>
      </div>
    ),
  }
);

export default function TimesSquareNotebookViewer() {
  return <TimesSquareNotebookViewerClient />;
}
