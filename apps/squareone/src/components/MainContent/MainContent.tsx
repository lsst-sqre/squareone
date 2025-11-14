import type React from 'react';
import styled from 'styled-components';

import { ContentMaxWidth } from '../../styles/sizes';

type MainContentProps = {
  children?: React.ReactNode;
};

const StyledMain = styled.main`
  margin: 0 auto;
  max-width: ${ContentMaxWidth};
  padding: 0 var(--size-screen-padding-min);

  @media (min-width: ${ContentMaxWidth}) {
    padding: 0;
  }
`;

/*
 * Main content wrapper (contained within a Page component).
 */
export default function MainContent({ children }: MainContentProps) {
  return <StyledMain>{children}</StyledMain>;
}
