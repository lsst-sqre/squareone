import React from 'react';
/* Login component with proper hydration handling */

import { getLoginUrl, PrimaryNavigation } from '@lsst-sqre/squared';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useUserInfo from '../../hooks/useUserInfo';
import UserMenu from './UserMenu';

type LoginProps = {
  pageUrl: URL;
};

export default function Login({ pageUrl }: LoginProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const { isLoggedIn, isLoading } = useUserInfo();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Always render "Log in" link on server and initial client render
  // to avoid hydration mismatch
  if (!hasMounted) {
    return (
      <LoginNavItem>
        <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl.toString())}>
          Log in
        </PrimaryNavigation.TriggerLink>
      </LoginNavItem>
    );
  }

  // After hydration, check loading state first
  if (isLoading) {
    return (
      <LoginNavItem>
        <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl.toString())}>
          Log in
        </PrimaryNavigation.TriggerLink>
      </LoginNavItem>
    );
  }

  // Show appropriate content based on login status
  if (isLoggedIn === true) {
    return (
      <LoginNavItem>
        <UserMenu pageUrl={pageUrl} />
      </LoginNavItem>
    );
  }

  return (
    <LoginNavItem>
      <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl.toString())}>
        Log in
      </PrimaryNavigation.TriggerLink>
    </LoginNavItem>
  );
}

const LoginNavItem = styled(PrimaryNavigation.Item)`
  margin-left: auto !important;
  margin-right: 0 !important;
  margin-top: 0;
  margin-bottom: 0;

  /* Ensure consistent width to prevent layout shifts */
  min-width: fit-content;
  flex-shrink: 0;

  color: var(--rsd-component-header-nav-text-color);
  a {
    color: var(--rsd-component-header-nav-text-color);
  }

  a:hover {
    color: var(--rsd-component-header-nav-text-hover-color);
  }
`;
