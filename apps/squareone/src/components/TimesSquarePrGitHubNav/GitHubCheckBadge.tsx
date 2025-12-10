import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type React from 'react';
import styles from './GitHubCheckBadge.module.css';

type GitHubCheckStatus = 'queued' | 'in_progress' | 'completed';

type GitHubCheckConclusion =
  | 'success'
  | 'failure'
  | 'neutral'
  | 'cancelled'
  | 'timed_out'
  | 'action_required'
  | 'stale'
  | null;

type GitHubCheckBadgeProps = {
  /**
   * The title of the GitHub check run.
   */
  title?: string;
  /**
   * The check run's status, transmitted through the Times Square API.
   */
  status?: GitHubCheckStatus;
  /**
   * The check run's conclusion, transmitted through the Times Square API.
   *
   * Can be null if the status is not "completed".
   */
  conclusion?: GitHubCheckConclusion;
  /**
   * The URL for the check run on GitHub.
   */
  url?: string;
};

/**
 * An inline component showing the status of a GitHub check run.
 */
export default function GitHubCheckBadge({
  title = '',
  status = 'in_progress',
  conclusion = null,
  url = '#',
}: GitHubCheckBadgeProps) {
  let icon: React.ReactElement;
  if (status === 'completed') {
    if (conclusion === 'success') {
      icon = (
        <FontAwesomeIcon
          icon="circle-check"
          className={styles.icon}
          style={{ color: 'var(--rsd-color-green-500)' }}
        />
      );
    } else if (conclusion === 'failure') {
      icon = (
        <FontAwesomeIcon
          icon="circle-xmark"
          className={styles.icon}
          style={{ color: 'var(--rsd-color-red-500)' }}
        />
      );
    } else {
      // some other conclusion than success/failure
      icon = (
        <FontAwesomeIcon
          icon="circle-minus"
          className={styles.icon}
          style={{ color: 'var(--rsd-color-yellow-500)' }}
        />
      );
    }
  } else {
    // no result yet
    icon = (
      <FontAwesomeIcon
        icon="circle-minus"
        className={styles.icon}
        style={{ color: 'var(--rsd-color-gray-500)' }}
      />
    );
  }
  return (
    <a href={url}>
      {icon} {title}
    </a>
  );
}
