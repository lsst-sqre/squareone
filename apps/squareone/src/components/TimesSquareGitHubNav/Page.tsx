import React from 'react';
/* A "Page" filesystem tree item, which links to a single page.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import styled from 'styled-components';

type PageProps = {
  title: string;
  path: string;
  current: boolean;
};

function Page({ title, path, current }: PageProps) {
  return (
    <Wrapper $current={current}>
      <StyledFontAwesomeIcon icon="file" />
      <Link href={path} legacyBehavior>
        {title}
      </Link>
    </Wrapper>
  );
}

const Wrapper = styled.div<{ $current: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: var(--row-height);
  color: inherit;
  font-weight: ${(props) => (props.$current ? 'bold' : 'normal')};
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.25em;
  font-size: 0.8em;
  opacity: 0.9;
  display: block;
`;

export default Page;
