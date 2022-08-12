/* A "Page" filesystem tree item, which links to a single page.
 *
 * This is based on a Josh Comeau blog post:
 * https://www.joshwcomeau.com/react/file-structure/
 */

import styled from 'styled-components';
import Link from 'next/link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Page({ title, path, current }) {
  return (
    <Wrapper current={current}>
      <StyledFontAwesomeIcon icon="file" />
      <Link href={path}>{title}</Link>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--row-height);
  color: inherit;
  font-weight: ${(props) => (props.current ? 'bold' : 'normal')};
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 0.25em;
  font-size: 0.8em;
  opacity: 0.9;
  display: block;
`;

export default Page;
