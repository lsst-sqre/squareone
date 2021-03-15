import styled from 'styled-components';

import HeaderNav from './headerNav';
import HeaderLogo from './headerLogo';

const StyledHeader = styled.header`
  width: 100%;
  margin: 0;
  padding: 10px;

  background-color: var(--rsd-color-gray-800);
  color: var(--rsd-color-gray-100);

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-end;
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
