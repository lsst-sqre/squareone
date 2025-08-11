import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function GitHubEditLink({ owner, repository, sourcePath }) {
  if (!owner || !repository || !sourcePath) {
    return null;
  }

  const editUrl = `https://github.com/${owner}/${repository}/blob/main/${sourcePath}`;

  return (
    <p>
      <a href={editUrl}>
        <StyledFontAwesomeIcon icon="fa-brands fa-github" />
        {owner}/{repository}
      </a>
    </p>
  );
}

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.2em;
  font-size: 1em;
  color: ${(props) => props.$color || 'inherit'};
`;
