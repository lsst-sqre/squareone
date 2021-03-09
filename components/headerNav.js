import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';

import { useCurrentUrl } from '../hooks/currentUrl';
import { Login } from './login';

const StyledNav = styled.nav`
  margin: 0 0 35px 0;
  padding: 0;
  display: flex;
  justify-self: end;
  font-size: 1.2rem;
`;

const NavItem = styled.div`
  margin: 0 1em;

  &:hover {
    color: var(--rsd-color-primary-400);
  }
`;

/*
 * Navigation (within the Header).
 */
export default function HeaderNav({ loginData }) {
  const currentUrl = useCurrentUrl();

  return (
    <StyledNav>
      <NavItem>
        <Link href="/">Portal</Link>
      </NavItem>

      <NavItem>
        <Link href="/">Notebooks</Link>
      </NavItem>

      <NavItem>
        <Link href="/">APIs</Link>
      </NavItem>

      <NavItem>
        <Link href="/">Documentation</Link>
      </NavItem>

      <NavItem>
        <Login loginData={loginData} pageUrl={currentUrl} />
      </NavItem>
    </StyledNav>
  );
}

HeaderNav.propTypes = {
  loginData: PropTypes.object.isRequired,
};
