/*
 * Client-only TimesSquareMainGitHubNav component - handles GitHub nav on client side only.
 */

import { useGitHubContents } from '@lsst-sqre/times-square-client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import styles from './TimesSquareMainGitHubNavClient.module.css';

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

  const repertoireUrl = useRepertoireUrl();
  const { contents, isLoading } = useGitHubContents({ repertoireUrl });

  // Focus mode for the main tree: the reserved ts_nav_focus query parameter
  // scopes the sidebar to a single org, repo, or directory.
  const searchParams = useSearchParams();
  const focusPath = searchParams?.get('ts_nav_focus') ?? null;

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  if (isLoading || !contents) {
    return null;
  }

  return (
    <div className={styles.container}>
      <TimesSquareGitHubNav
        contentNodes={contents}
        pagePath={pagePath}
        pagePathRoot="/times-square/github"
        focusPath={focusPath}
      />
    </div>
  );
}

export default TimesSquareMainGitHubNavClient;
