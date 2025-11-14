/*
 * A "directory" filesystem tree item, which holds contents.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type React from 'react';
import styled from 'styled-components';

type DirectoryProps = {
  title: string;
  current: boolean;
  children: React.ReactNode;
};

function Directory({ title, current, children }: DirectoryProps) {
  return (
    <Wrapper>
      <Header $current={current}>
        <StyledFontAwesomeIcon icon="angle-down" />
        {title}
      </Header>
      <Contents $current={current}>{children}</Contents>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const Header = styled.div<{ $current: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: var(--row-height);
  color: inherit;
  font-weight: ${(props) => (props.$current ? 'bold' : 'normal')};
`;

const Contents = styled.div<{ $current: boolean }>`
  padding-left: calc(16px + 4px);
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.25em;
  font-size: 0.8em;
  opacity: 0.9;
  display: block;
`;

export default Directory;
