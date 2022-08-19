import React from 'react';

import styled from 'styled-components';

export default function GitHubPrBadge({
  state,
  number,
  url,
  title,
  authorName,
  authorAvatarUrl,
  authorUrl,
}) {
  return (
    <span>
      <PrStatusIcon state={state} url={url} />{' '}
      <HiddenLink href={url}>{`#${number} ${title}`}</HiddenLink> by{' '}
      <HiddenLink href={authorUrl}>
        <AvatarImage src={authorAvatarUrl} /> {authorName}
      </HiddenLink>
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

function PrStatusIcon({ state, url }) {
  return (
    <StatusIconLink href={url} state={state}>
      {state}
    </StatusIconLink>
  );
}

/**
 * Map pull request states to their GitHub colours.
 *
 * @param {String} state
 * @returns A CSS colour.
 */
function getStateColour(state) {
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

const StatusIconLink = styled.a`
  padding: 2px 10px;
  color: #fff;
  background-color: ${(props) => getStateColour(props.state)};
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
