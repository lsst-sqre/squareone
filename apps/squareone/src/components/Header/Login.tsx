/* Login component with dynamic import to prevent SSR issues */

import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { PrimaryNavigation } from '@lsst-sqre/squared';

type LoginProps = {
  pageUrl: URL;
};

// Dynamic import with SSR disabled to prevent SWR hook issues
const LoginClient = dynamic(() => import('./LoginClient'), {
  ssr: false,
  loading: () => (
    <LoginNavItem>
      <PrimaryNavigation.TriggerLink href="/login">
        Log in
      </PrimaryNavigation.TriggerLink>
    </LoginNavItem>
  ),
});

export default function Login({ pageUrl }: LoginProps) {
  return <LoginClient pageUrl={pageUrl} />;
}

const LoginNavItem = styled(PrimaryNavigation.Item)`
  margin: 0 0 0 auto;
`;
