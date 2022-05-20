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
  width: 18rem;
  padding-top: var(--size-screen-padding-min);
`;

const AppTitle = styled.p`
  font-size: 2rem;
  margin-bottom: 2rem;
  margin-top: 0.67rem;
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

export default function Sidebar() {
  return (
    <StyledSidebar>
      <AppTitle>Times Square</AppTitle>

      <SectionTitle>Rubin’s boards</SectionTitle>

      <GitHubContentsTree />
    </StyledSidebar>
  );
}
