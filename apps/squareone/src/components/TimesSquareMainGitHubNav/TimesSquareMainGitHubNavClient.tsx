/*
 * Client-only TimesSquareMainGitHubNav component - uses SWR without SSR conflicts
 * This component handles the useGitHubContentsListing hook on the client side only.
 */

import { useEffect, useState } from 'react';
import { useAppConfig } from '../../contexts/AppConfigContext';
import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import styles from './TimesSquareMainGitHubNavClient.module.css';
import useGitHubContentsListing from './useGitHubContentsListing';

type TimesSquareMainGitHubNavClientProps = {
  pagePath: string;
};

function TimesSquareMainGitHubNavClient({
  pagePath,
}: TimesSquareMainGitHubNavClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { timesSquareUrl } = useAppConfig();
  const githubContents = useGitHubContentsListing(timesSquareUrl);

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  if (!githubContents) {
    return null;
  }

  return (
    <div className={styles.container}>
      <TimesSquareGitHubNav
        contentNodes={githubContents.contents}
        pagePath={pagePath}
        pagePathRoot="/times-square/github"
      />
    </div>
  );
}

export default TimesSquareMainGitHubNavClient;
