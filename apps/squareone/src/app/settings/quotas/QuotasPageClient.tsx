'use client';

import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';

import AuthRequired from '../../../components/AuthRequired';
import QuotasView from '../../../components/QuotasView';
import { Lede } from '../../../components/Typography';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';
import { useStaticConfig } from '../../../hooks/useStaticConfig';
import { getDocsUrl } from '../../../lib/utils/docsUrls';

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
  // Labels the rate limits by service; absent while discovery loads or when it
  // is not configured, in which case the raw quota labels are shown.
  const { query } = useServiceDiscovery(repertoireUrl ?? '');
  const { docsBaseUrl } = useStaticConfig();
  const quotasDocsUrl = getDocsUrl(docsBaseUrl, '/guides/life/quotas.html');

  return (
    <>
      <h1>Quotas</h1>
      <Lede>
        Information about limits to your current resource usage on the Rubin
        Science Platform. These limits can change.{' '}
        <a href={quotasDocsUrl}>Learn more about quotas</a> in the
        documentation.
      </Lede>
      {userInfo?.quota ? (
        <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
          <QuotasView
            quota={userInfo.quota}
            quotaLabelIndex={query?.getQuotaLabelIndex()}
          />
        </div>
      ) : (
        <p>Not configured</p>
      )}
    </>
  );
}
