/*
 * The navigational sidebar for Times Square.
 */

import Link from 'next/link';
import styled from 'styled-components';

import GitHubContentsTree from './GitHubContentsTree';

const StyledSidebar = styled.div`
  padding: 0 var(--size-screen-padding-min);
  border-right: 3px solid var(--rsd-color-gray-100);
  padding-left: 0.5rem;
  padding-top: 0;
  width: 18rem;
`;

const AppTitle = styled.p`
  font-size: 2rem;
  margin-bottom: 2rem;
  margin-top: 0.67em;
  font-weight: bold;
  color: var(--rsd-component-text-headline-color);
`;

const SectionTitle = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--rsd-component-text-headline-color);
`;

export default function Sidebar({ pagePath }) {
  return (
    <StyledSidebar>
      <AppTitle>Times Square</AppTitle>

      <GitHubContentsTree pagePath={pagePath} />
    </StyledSidebar>
  );
}
