/*
 * Client-only TimesSquarePrGitHubNav component - handles PR GitHub nav on client side only.
 */

import { useGitHubPrContents } from '@lsst-sqre/times-square-client';
import { useEffect, useState } from 'react';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import TimesSquareGitHubNav from '../TimesSquareGitHubNav';
import GitHubCheckBadge from './GitHubCheckBadge';
import GitHubPrBadge from './GitHubPrBadge';
import GitHubPrTitle from './GitHubPrTitle';
import styles from './TimesSquarePrGitHubNavClient.module.css';

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

  const repertoireUrl = useRepertoireUrl();
  const { contents, pullRequests, yamlCheck, nbCheck, isLoading, error } =
    useGitHubPrContents(owner, repo, commitSha, { repertoireUrl });

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  if (!(isLoading || error)) {
    return (
      <section className={styles.section}>
        {showPrDetails && (
          <>
            <GitHubPrTitle owner={owner} repo={repo} commit={commitSha} />

            <ul className={styles.itemList}>
              {pullRequests.map((pr) => (
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
          contentNodes={contents}
          pagePathRoot="/times-square/github-pr"
          pagePath={null}
        />
      </section>
    );
  }

  return null; // still loading
}

export default TimesSquarePrGitHubNavClient;
