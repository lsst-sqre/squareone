import React from 'react';
import styled from 'styled-components';
import getConfig from 'next/config';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { PrimaryNavigation } from '@lsst-sqre/squared';

import useCurrentUrl from '../../hooks/useCurrentUrl';
import Login from './Login';
import AppsMenu from './AppsMenu';

type InternalTriggerLinkProps = {
  href: string;
  children: React.ReactNode;
};

/*
 * Navigation (within the Header).
 */
export default function HeaderNav() {
  const currentUrl = useCurrentUrl();
  const { publicRuntimeConfig } = getConfig();

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

      {publicRuntimeConfig.enableAppsMenu && (
        <NavItem>
          <AppsMenu />
        </NavItem>
      )}

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

      <Login pageUrl={currentUrl} />
    </StyledNav>
  );
}

const StyledNav = styled(PrimaryNavigation)`
  margin: 0;
  padding: 0;
  width: 100%;
  font-size: 1.2rem;
`;

const NavItem = styled(PrimaryNavigation.Item)`
  margin: 0 1em;

  &:first-of-type {
    margin-left: 0;
  }

  color: var(--rsd-component-header-nav-text-color);
  a {
    color: var(--rsd-component-header-nav-text-color);
  }

  a:hover {
    color: var(--rsd-component-header-nav-text-hover-color);
  }
`;

const InternalTriggerLink = ({ href, children }: InternalTriggerLinkProps) => {
  const router = useRouter();
  const isActive = href === router.pathname;

  return (
    <NextLink href={href} legacyBehavior>
      <PrimaryNavigation.TriggerLink className="NavigationMenuLink">
        {children}
      </PrimaryNavigation.TriggerLink>
    </NextLink>
  );
};
