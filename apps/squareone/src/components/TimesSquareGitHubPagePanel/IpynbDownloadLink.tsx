import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

type IpynbDownloadLinkProps = {
  url: string;
  sourcePath: string | null;
};

export default function IpynbDownloadLink({
  url,
  sourcePath,
}: IpynbDownloadLinkProps) {
  // get the filename from the sourcePath
  const filename = sourcePath ? sourcePath.split('/').pop() : undefined;

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
`;
