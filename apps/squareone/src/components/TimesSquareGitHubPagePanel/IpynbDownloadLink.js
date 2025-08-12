import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function IpynbDownloadLink({ url, sourcePath }) {
  // get the filename from the sourcePath
  const filename = sourcePath.split('/').pop();

  return (
    <StyledP>
      <a href={url} title={filename} download={filename}>
        <StyledFontAwesomeIcon icon="download" /> Download notebook
      </a>
    </StyledP>
  );
}

const StyledP = styled.p`
  margin-top: 2rem;
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.2em;
  font-size: 1em;
  color: ${(props) => props.$color || 'inherit'};
`;
