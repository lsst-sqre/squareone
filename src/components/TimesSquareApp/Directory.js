/*
 * A "directory" filesystem tree item, which holds contents.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import styled from 'styled-components';

import Page from './Page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Directory({ title, path, children }) {
  return (
    <Wrapper>
      <Header>
        <StyledFontAwesomeIcon icon="angle-down" />
        {title}
      </Header>
      <Contents>{children}</Contents>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--row-height);
  color: inherit;
`;

const Contents = styled.div`
  padding-left: calc(16px + 4px);
  height: 0px;
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.25em;
  font-size: 0.8em;
  opacity: 0.9;
  display: block;
`;

export default Directory;
