/*
 * The navigational sidebar for Times Square.
 */

import styled from 'styled-components';

import GitHubContentsTree from './GitHubContentsTree';

const StyledSidebar = styled.div`
  padding: 0 var(--size-screen-padding-min);
  border-right: 3px solid var(--rsd-color-gray-100);
  padding-left: 0.5rem;
  width: 18rem;
`;

export default function Sidebar() {
  return (
    <StyledSidebar>
      <p>Times Square</p>
      <GitHubContentsTree />
    </StyledSidebar>
  );
}
