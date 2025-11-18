import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';

type GitHubEditLinkProps = {
  owner: string | null;
  repository: string | null;
  sourcePath: string | null;
};

export default function GitHubEditLink({
  owner,
  repository,
  sourcePath,
}: GitHubEditLinkProps) {
  if (!owner || !repository || !sourcePath) {
    return null;
  }

  const editUrl = `https://github.com/${owner}/${repository}/blob/main/${sourcePath}`;

  return (
    <p>
      <a href={editUrl}>
        <StyledFontAwesomeIcon icon={['fab', 'github']} />
        {owner}/{repository}
      </a>
    </p>
  );
}

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.2em;
  font-size: 1em;
`;
