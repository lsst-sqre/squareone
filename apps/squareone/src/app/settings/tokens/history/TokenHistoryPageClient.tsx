'use client';

import AuthRequired from '../../../../components/AuthRequired';
import { TokenHistoryView } from '../../../../components/TokenHistory';
import { useUserInfo } from '../../../../hooks/useUserInfo';

export default function TokenHistoryPageClient() {
  return (
    <AuthRequired>
      <TokenHistoryContent />
    </AuthRequired>
  );
}

function TokenHistoryContent() {
  const { userInfo } = useUserInfo();

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
