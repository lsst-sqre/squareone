/* Login component */

import styled from 'styled-components';
import useUserInfo from '../../hooks/useUserInfo';
import UserMenu from './UserMenu';
import { PrimaryNavigation, getLoginUrl } from '@lsst-sqre/squared';

type LoginProps = {
  pageUrl: URL;
};

export default function Login({ pageUrl }: LoginProps) {
  const { isLoggedIn } = useUserInfo();

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
