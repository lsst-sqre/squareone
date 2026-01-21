'use client';

import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import { Button } from '@lsst-sqre/squared';
import Link from 'next/link';

import AccessTokensView from '../../../components/AccessTokensView';
import AuthRequired from '../../../components/AuthRequired';
import { Lede } from '../../../components/Typography';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';

export default function TokensPageClient() {
  return (
    <AuthRequired>
      <TokensContent />
    </AuthRequired>
  );
}

function TokensContent() {
  const repertoireUrl = useRepertoireUrl();
  const { userInfo } = useUserInfo(repertoireUrl);

  return (
    <>
      <h1>Access tokens</h1>
      <Lede>Manage your RSP API access tokens.</Lede>
      <Button as={Link} href="/settings/tokens/new">
        Create a token
      </Button>
      {userInfo && (
        <>
          <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
            <AccessTokensView username={userInfo.username} />
          </div>
          <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
            <Button
              appearance="outline"
              tone="secondary"
              as={Link}
              href="/settings/tokens/history"
            >
              View history
            </Button>
          </div>
        </>
      )}
    </>
  );
}
