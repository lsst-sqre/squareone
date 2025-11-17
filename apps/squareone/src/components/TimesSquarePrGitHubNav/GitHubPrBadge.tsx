import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

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
      <HiddenLink href={url}>{`#${number} ${title}`}</HiddenLink> by{' '}
      <AuthorSpan>
        <HiddenLink href={authorUrl}>
          <AvatarImage src={authorAvatarUrl} alt="" /> {authorName}
        </HiddenLink>
      </AuthorSpan>
    </span>
  );
}

const HiddenLink = styled.a`
  color: inherit;
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`;

function PrStatusIcon({ state, url }: PrStatusIconProps) {
  let icon;
  if (state === 'closed') {
    icon = <StyledFontAwesomeIcon icon="circle-xmark" />;
  } else if (state === 'merged') {
    icon = <StyledFontAwesomeIcon icon="code-merge" />;
  } else {
    icon = <StyledFontAwesomeIcon icon="code-pull-request" />;
  }

  return (
    <StatusIconLink href={url} $state={state}>
      {icon} {state}
    </StatusIconLink>
  );
}

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.2em;
  font-size: 0.9em;
`;

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

const StatusIconLink = styled.a<{ $state?: GitHubPrState }>`
  padding: 2px 10px;
  color: #fff;
  background-color: ${(props) => getStateColour(props.$state)};
  border-radius: 0.5em;
  text-transform: capitalize;

  &:hover {
    color: #fff;
  }
`;

const AvatarImage = styled.img`
  height: 1.3em;
  width: 1.3em;
  margin: 0 0.1em 0 0.1em;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
  overflow: hidden;
`;

const AuthorSpan = styled.span`
  display: inline-block;
`;
