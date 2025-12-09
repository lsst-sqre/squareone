/*
 * Client-only TimesSquarePrGitHubNav component - uses SWR without SSR conflicts
 * This component handles the useGitHubPrContentsListing hook on the client side only.
 */

import { useEffect, useState } from 'react';
import { useAppConfig } from '../../contexts/AppConfigContext';
import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import GitHubCheckBadge from './GitHubCheckBadge';
import GitHubPrBadge from './GitHubPrBadge';
import GitHubPrTitle from './GitHubPrTitle';
import styles from './TimesSquarePrGitHubNavClient.module.css';
import useGitHubPrContentsListing from './useGitHubPrContentsListing';

type TimesSquarePrGitHubNavClientProps = {
  owner: string;
  repo: string;
  commitSha: string;
  showPrDetails?: boolean;
};

function TimesSquarePrGitHubNavClient({
  owner,
  repo,
  commitSha,
  showPrDetails = true,
}: TimesSquarePrGitHubNavClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { timesSquareUrl } = useAppConfig();
  const githubContents = useGitHubPrContentsListing(
    timesSquareUrl,
    owner,
    repo,
    commitSha
  );

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  if (!(githubContents.loading || githubContents.error)) {
    const { nbCheck, yamlCheck } = githubContents;

    return (
      <section className={styles.section}>
        {showPrDetails && (
          <>
            <GitHubPrTitle owner={owner} repo={repo} commit={commitSha} />

            <ul className={styles.itemList}>
              {githubContents.pullRequests.map((pr) => (
                <li key={`pr-${pr.number}`}>
                  <GitHubPrBadge
                    state={pr.state}
                    number={pr.number}
                    url={pr.conversation_url}
                    title={pr.title}
                    authorName={pr.contributor.username}
                    authorAvatarUrl={pr.contributor.avatar_url}
                    authorUrl={pr.contributor.html_url}
                  />
                </li>
              ))}
            </ul>

            <ul className={styles.itemList}>
              {nbCheck && (
                <li>
                  <GitHubCheckBadge
                    status={nbCheck.status}
                    title={nbCheck.report_title}
                    conclusion={nbCheck.conclusion}
                    url={nbCheck.html_url}
                  />
                </li>
              )}
              {yamlCheck && (
                <li>
                  <GitHubCheckBadge
                    status={yamlCheck.status}
                    title={yamlCheck.report_title}
                    conclusion={yamlCheck.conclusion}
                    url={yamlCheck.html_url}
                  />
                </li>
              )}
            </ul>
          </>
        )}

        <h3>Notebooks</h3>
        <TimesSquareGitHubNav
          contentNodes={githubContents.contents}
          pagePathRoot="/times-square/github-pr"
          pagePath={null}
        />
      </section>
    );
  }

  return null; // still loading
}

export default TimesSquarePrGitHubNavClient;
