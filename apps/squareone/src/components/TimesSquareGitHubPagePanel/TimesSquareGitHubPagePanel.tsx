/*
 * TimesSquareGitHubPagePanel with dynamic import to prevent SSR issues
 * Uses client-only component to handle SWR hooks safely.
 */

import dynamic from 'next/dynamic';
import styles from './TimesSquareGitHubPagePanelClient.module.css';

// Dynamic import with SSR disabled to prevent SWR hook issues
const TimesSquareGitHubPagePanelClient = dynamic(
  () => import('./TimesSquareGitHubPagePanelClient'),
  {
    ssr: false,
    loading: () => (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    ),
  }
);

export default function TimesSquareGitHubPagePanel() {
  return <TimesSquareGitHubPagePanelClient />;
}
