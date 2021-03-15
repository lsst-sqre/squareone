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
  width: 100%;
  font-size: 1.2rem;
`;

const NavItem = styled.div`
  margin: 0 1em;

  &:hover {
    color: var(--rsd-color-primary-400);
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
