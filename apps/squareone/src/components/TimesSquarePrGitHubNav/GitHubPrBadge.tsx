import { CircleX, GitMerge, GitPullRequest } from 'lucide-react';
import type React from 'react';
import styles from './GitHubPrBadge.module.css';

type GitHubPrState = 'open' | 'draft' | 'merged' | 'closed';

type GitHubPrBadgeProps = {
  /**
   * Pull request state.
   */
  state?: GitHubPrState;
  /**
   * GitHub repository issue/PR number.
   */
  number?: number;
  /**
   * URL for the PR's homepage on GitHub.
   */
  url?: string;
  /**
   * Title of the PR
   */
  title?: string;
  /**
   * GitHub username of the PR creator.
   */
  authorName?: string;
  /**
   * URL for the PR creator's avatar (icon).
   */
  authorAvatarUrl?: string;
  /**
   * Profile URL for the PR creator.
   */
  authorUrl?: string;
};

type PrStatusIconProps = {
  state?: GitHubPrState;
  url?: string;
};

export default function GitHubPrBadge({
  state,
  number,
  url,
  title,
  authorName,
  authorAvatarUrl,
  authorUrl,
}: GitHubPrBadgeProps) {
  return (
    <span>
      <PrStatusIcon state={state} url={url} />{' '}
      <a className={styles.hiddenLink} href={url}>{`#${number} ${title}`}</a> by{' '}
      <span className={styles.authorSpan}>
        <a className={styles.hiddenLink} href={authorUrl}>
          <img className={styles.avatarImage} src={authorAvatarUrl} alt="" />{' '}
          {authorName}
        </a>
      </span>
    </span>
  );
}

/**
 * Map pull request states to their GitHub colours.
 */
function getStateColour(state?: GitHubPrState): string {
  if (state === 'closed') {
    return 'rgb(207, 34, 46)';
  } else if (state === 'merged') {
    return 'rgb(130, 80, 223)';
  } else if (state === 'draft') {
    return 'rgb(110, 119, 129)';
  }
  // an open PR
  return 'rgb(45, 164, 78)';
}

function PrStatusIcon({ state, url }: PrStatusIconProps) {
  let icon: React.ReactElement;
  if (state === 'closed') {
    icon = <CircleX className={styles.icon} />;
  } else if (state === 'merged') {
    icon = <GitMerge className={styles.icon} />;
  } else {
    icon = <GitPullRequest className={styles.icon} />;
  }

  return (
    <a
      href={url}
      className={styles.statusIconLink}
      style={{ '--status-color': getStateColour(state) } as React.CSSProperties}
    >
      {icon} {state}
    </a>
  );
}
