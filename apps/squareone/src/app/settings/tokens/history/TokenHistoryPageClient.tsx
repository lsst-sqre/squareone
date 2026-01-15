'use client';

import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';

import AuthRequired from '../../../../components/AuthRequired';
import { TokenHistoryView } from '../../../../components/TokenHistory';
import { useRepertoireUrl } from '../../../../hooks/useRepertoireUrl';

export default function TokenHistoryPageClient() {
  return (
    <AuthRequired>
      <TokenHistoryContent />
    </AuthRequired>
  );
}

function TokenHistoryContent() {
  const repertoireUrl = useRepertoireUrl();
  const { userInfo } = useUserInfo(repertoireUrl);

  return (
    <>
      <h1>Token History</h1>
      {userInfo && (
        <TokenHistoryView
          username={userInfo.username}
          initialTokenType="user"
          showFilters={true}
        />
      )}
    </>
  );
}
