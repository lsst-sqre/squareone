import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * An inline component showing the status of a GitHub check run.
 */
export default function GitHubCheckBadge({ title, status, conclusion, url }) {
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

GitHubCheckBadge.propTypes = {
  /**
   * The title of the GitHub check run.
   */
  title: PropTypes.string,
  /**
   * The check run's status, transmitted through the Times Square API.
   */
  status: PropTypes.oneOf(['queued', 'in_progress', 'completed']),
  /**
   * The check run's conclusion, transmitted through the Times Square API.
   *
   * Can be null if the status is not "completed".
   */
  conclusion: PropTypes.oneOf([
    'success',
    'failure',
    'neutral',
    'cancelled',
    'timed_out',
    'action_required',
    'stale',
    null,
  ]),
  /**
   * The URL for the check run on GitHub.
   */
  url: PropTypes.url,
};

GitHubCheckBadge.defaultProps = {
  title: '',
  status: 'in_progress',
  conclusion: null,
  url: '#',
};

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.2em;
  font-size: 1em;
  color: ${(props) => props.$color || 'inherit'};
`;
