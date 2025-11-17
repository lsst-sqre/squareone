import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

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
  let icon;
  if (status === 'completed') {
    if (conclusion === 'success') {
      icon = (
        <StyledFontAwesomeIcon
          icon="circle-check"
          $color="var(--rsd-color-green-500)"
        />
      );
    } else if (conclusion === 'failure') {
      icon = (
        <StyledFontAwesomeIcon
          icon="circle-xmark"
          $color="var(--rsd-color-red-500)"
        />
      );
    } else {
      // some other conclusion than success/failure
      icon = (
        <StyledFontAwesomeIcon
          icon="circle-minus"
          $color="var(--rsd-color-yellow-500)"
        />
      );
    }
  } else {
    // no result yet
    icon = (
      <StyledFontAwesomeIcon
        icon="circle-minus"
        $color="var(--rsd-color-gray-500)"
      />
    );
  }
  return (
    <a href={url}>
      {icon} {title}
    </a>
  );
}

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)<{ $color?: string }>`
  margin-right: 0.2em;
  font-size: 1em;
  color: ${(props) => props.$color || 'inherit'};
`;
