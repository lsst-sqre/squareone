'use client';

import {
  createDiscoveryQuery,
  useServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { useMemo } from 'react';

import AuthRequired from '../../../components/AuthRequired';
import QuotasView from '../../../components/QuotasView';
import { Lede } from '../../../components/Typography';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';
import { useStaticConfig } from '../../../hooks/useStaticConfig';
import { useUserInfo } from '../../../hooks/useUserInfo';
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
  const { userInfo } = useUserInfo();
  // Discovery labels the rate limits by service. Without it (no repertoireUrl,
  // or a failed fetch, which resolves to the empty discovery) the raw quota
  // labels are shown.
  const { discovery, isPending } = useServiceDiscovery(repertoireUrl ?? '');
  // Keyed on the discovery data, which is stable across renders; the hook
  // recreates its query wrapper on every render.
  const quotaLabelIndex = useMemo(
    () =>
      discovery
        ? createDiscoveryQuery(discovery).getQuotaLabelIndex()
        : undefined,
    [discovery]
  );
  // With discovery configured, hold the quotas until it arrives so the rate
  // limits first render labelled, not as raw quota labels that then re-label,
  // re-sort, and drop internal rows. Without a repertoireUrl the disabled
  // query stays pending, so there is nothing to wait for.
  const isDiscoveryPending = !!repertoireUrl && isPending;
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
        !isDiscoveryPending && (
          <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
            <QuotasView
              quota={userInfo.quota}
              quotaLabelIndex={quotaLabelIndex}
            />
          </div>
        )
      ) : (
        <p>Not configured</p>
      )}
    </>
  );
}
