'use client';

import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';

import AuthRequired from '../../../components/AuthRequired';
import QuotasView from '../../../components/QuotasView';
import { Lede } from '../../../components/Typography';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';

export default function QuotasPageClient() {
  return (
    <AuthRequired>
      <QuotasContent />
    </AuthRequired>
  );
}

function QuotasContent() {
  const repertoireUrl = useRepertoireUrl();
  const { userInfo } = useUserInfo(repertoireUrl);

  return (
    <>
      <h1>Quotas</h1>
      <Lede>
        Information about limits to your current resource usage on the Rubin
        Science Platform. These limits can change.
      </Lede>
      {userInfo?.quota ? (
        <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
          <QuotasView quota={userInfo.quota} />
        </div>
      ) : (
        <p>Not configured</p>
      )}
    </>
  );
}
