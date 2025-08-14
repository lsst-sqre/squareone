/* Client-only Login component - uses SWR without SSR conflicts */

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import useUserInfo from '../../hooks/useUserInfo';
import UserMenu from './UserMenu';
import { PrimaryNavigation, getLoginUrl } from '@lsst-sqre/squared';

type LoginClientProps = {
  pageUrl: URL;
};

export default function LoginClient({ pageUrl }: LoginClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoggedIn } = useUserInfo();

  // Show loading state until client-side hydration
  if (!isClient) {
    return (
      <LoginNavItem>
        <PrimaryNavigation.TriggerLink href={getLoginUrl(pageUrl.toString())}>
          Log in
        </PrimaryNavigation.TriggerLink>
      </LoginNavItem>
    );
  }

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
  margin: 0 0 0 auto;
`;
