import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';

import { useCurrentUrl } from '../hooks/currentUrl';
import { Login } from './login';

const StyledNav = styled.nav`
  margin: 0 0 30px 0;
  padding: 0;
  display: flex;
  justify-self: end;
  width: 100%;
  font-size: 1.2rem;
`;

const NavItem = styled.div`
  margin: 0 1em;

  color: var(--rsd-component-header-nav-text-color);
  a {
    color: var(--rsd-component-header-nav-text-color);
  }

  a:hover {
    color: var(--rsd-component-header-nav-text-hover-color);
  }
`;

const LoginNavItem = styled(NavItem)`
  margin: 0 1em 0 auto;
`;

/*
 * Navigation (within the Header).
 */
export default function HeaderNav({ loginData }) {
  const currentUrl = useCurrentUrl();

  return (
    <StyledNav>
      <NavItem>
        <a href="/portal/app">Portal</a>
      </NavItem>

      <NavItem>
        <Link href="/nb">Notebooks</Link>
      </NavItem>

      <NavItem>
        <Link href="/">APIs</Link>
      </NavItem>

      <NavItem>
        <Link href="https://dp0-1.lsst.io/">Documentation</Link>
      </NavItem>

      <NavItem>
        <a href="https://community.lsst.org">Community</a>
      </NavItem>

      <LoginNavItem>
        <Login loginData={loginData} pageUrl={currentUrl} />
      </LoginNavItem>
    </StyledNav>
  );
}

HeaderNav.propTypes = {
  loginData: PropTypes.object.isRequired,
};
