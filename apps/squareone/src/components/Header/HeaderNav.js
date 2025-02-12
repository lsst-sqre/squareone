import PropTypes from 'prop-types';
import styled from 'styled-components';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { PrimaryNavigation } from '@lsst-sqre/squared';

import useCurrentUrl from '../../hooks/useCurrentUrl';
import Login from './Login';

/*
 * Navigation (within the Header).
 */
export default function HeaderNav() {
  const currentUrl = useCurrentUrl();

  return (
    <StyledNav>
      <NavItem>
        <PrimaryNavigation.TriggerLink href="/portal/app">
          Portal
        </PrimaryNavigation.TriggerLink>
      </NavItem>

      <NavItem>
        <PrimaryNavigation.TriggerLink href="/nb/hub">
          Notebooks
        </PrimaryNavigation.TriggerLink>
      </NavItem>

      <NavItem>
        <InternalTriggerLink href="/api-aspect">APIs</InternalTriggerLink>
      </NavItem>

      <NavItem>
        <InternalTriggerLink href="/docs">Documentation</InternalTriggerLink>
      </NavItem>

      <NavItem>
        <InternalTriggerLink href="/support">Support</InternalTriggerLink>
      </NavItem>

      <NavItem>
        <PrimaryNavigation.TriggerLink href="https://community.lsst.org">
          Community
        </PrimaryNavigation.TriggerLink>
      </NavItem>

      <LoginNavItem>
        <Login pageUrl={currentUrl} />
      </LoginNavItem>
    </StyledNav>
  );
}

const StyledNav = styled(PrimaryNavigation)`
  margin: 0 0 30px 0;
  padding: 0;
  /* display: flex; */
  justify-self: end;
  width: 100%;
  font-size: 1.2rem;
`;

const NavItem = styled(PrimaryNavigation.Item)`
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

const InternalTriggerLink = ({ href, ...props }) => {
  const router = useRouter();
  const isActive = href === router.pathname;

  return (
    <PrimaryNavigation.Trigger asChild active={isActive}>
      <NextLink href={href} className="NavigationMenuLink" {...props} />
    </PrimaryNavigation.Trigger>
  );
};

HeaderNav.propTypes = {};
