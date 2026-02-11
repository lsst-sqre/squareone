'use client';

import { useGitHubPrContents } from '@lsst-sqre/times-square-client';
import { GitCommitHorizontal } from 'lucide-react';
import { useParams } from 'next/navigation';

import TimesSquareApp from '../../../../../../components/TimesSquareApp';
import TimesSquarePrGitHubNav from '../../../../../../components/TimesSquarePrGitHubNav';
import GitHubCheckBadge from '../../../../../../components/TimesSquarePrGitHubNav/GitHubCheckBadge';
import GitHubPrBadge from '../../../../../../components/TimesSquarePrGitHubNav/GitHubPrBadge';
import { useRepertoireUrl } from '../../../../../../hooks/useRepertoireUrl';
import styles from './commit.module.css';

/**
 * Client component for GitHub PR preview landing page.
 *
 * Displays pull request information and GitHub check status badges
 * for a specific commit in a repository.
 */
export default function GitHubPrLandingClient() {
  const params = useParams();
  const repertoireUrl = useRepertoireUrl();

  const ownerStr = Array.isArray(params?.owner)
    ? params.owner[0]
    : (params?.owner ?? '');
  const repoStr = Array.isArray(params?.repo)
    ? params.repo[0]
    : (params?.repo ?? '');
  const commitStr = Array.isArray(params?.commit)
    ? params.commit[0]
    : (params?.commit ?? '');

  const { pullRequests, yamlCheck, nbCheck, isLoading, error } =
    useGitHubPrContents(ownerStr, repoStr, commitStr, { repertoireUrl });

  const pageNav = (
    <TimesSquarePrGitHubNav
      owner={ownerStr}
      repo={repoStr}
      commitSha={commitStr}
      showPrDetails={false}
    />
  );

  let prDetails: React.ReactNode;
  if (!(isLoading || error)) {
    prDetails = (
      <>
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
    );
  } else {
    prDetails = null;
  }

  return (
    <TimesSquareApp pageNav={pageNav}>
      <header className={styles.header}>
        <p className="subtitle">Pull Request Preview</p>
        <h1>
          {`${ownerStr}/${repoStr}`}{' '}
          <span className={styles.commitSpan}>
            <GitCommitHorizontal className={styles.commitIcon} />{' '}
            {commitStr.slice(0, 7)}
          </span>
        </h1>
      </header>

      {prDetails}
    </TimesSquareApp>
  );
}
