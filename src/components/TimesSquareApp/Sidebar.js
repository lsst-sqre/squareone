/*
 * The navigational sidebar for Times Square.
 */

import Link from 'next/link';
import styled from 'styled-components';

const StyledSidebar = styled.div`
  border-right: 1px solid var(--rsd-color-primary-600);
  padding: 0 var(--size-screen-padding-min) 2rem 0.5rem;
  width: 18rem;
`;

const AppTitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  margin-top: 0.67em;
  font-weight: bold;
  color: var(--rsd-component-text-headline-color);
  text-transform: uppercase;
`;

export default function Sidebar({ pageNav, pagePanel }) {
  return (
    <StyledSidebar>
      <Link href="/times-square">
        <a>
          <AppTitle>Times Square</AppTitle>
        </a>
      </Link>

      {pagePanel && pagePanel}

      {pageNav && pageNav}
    </StyledSidebar>
  );
}
