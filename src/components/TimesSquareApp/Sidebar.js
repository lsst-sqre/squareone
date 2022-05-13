/*
 * The navigational sidebar for Times Square.
 */

import styled from 'styled-components';

const StyledSidebar = styled.div`
  background-color: #dddddd;
  padding: 0 var(--size-screen-padding-min);
`;

export default function Sidebar() {
  return (
    <StyledSidebar>
      <p>Times Square</p>
    </StyledSidebar>
  );
}
