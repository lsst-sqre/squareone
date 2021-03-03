import styled from 'styled-components';

import HeaderNav from './headerNav';
import HeaderLogo from './headerLogo';

const StyledHeader = styled.header`
  width: 100%;
  margin: 0;
`;

/*
 * Site header, including logo, navigation, and log-in component.
 */
export default function Header() {
  return (
    <StyledHeader>
      <HeaderLogo />
      <HeaderNav />
    </StyledHeader>
  );
}
