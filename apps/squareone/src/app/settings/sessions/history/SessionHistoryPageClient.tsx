'use client';

import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import { Tabs } from '@lsst-sqre/squared';
import { useRouter, useSearchParams } from 'next/navigation';

import AuthRequired from '../../../../components/AuthRequired';
import { TokenHistoryView } from '../../../../components/TokenHistory';
import { useRepertoireUrl } from '../../../../hooks/useRepertoireUrl';

export default function SessionHistoryPageClient() {
  return (
    <AuthRequired>
      <SessionHistoryContent />
    </AuthRequired>
  );
}

// Map URL tab type to TokenHistoryView initialTokenType prop
function mapTabTypeToTokenType(
  tabType: string
): 'session' | 'notebook' | 'internal' {
  switch (tabType) {
    case 'web':
      return 'session';
    case 'notebook':
      return 'notebook';
    case 'internal':
      return 'internal';
    default:
      return 'session';
  }
}

function SessionHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repertoireUrl = useRepertoireUrl();
  const { userInfo } = useUserInfo(repertoireUrl);

  // Get active tab from URL query parameter, default to 'web'
  const activeTab = searchParams.get('type') || 'web';

  // Handle tab change by updating URL query parameter
  const handleTabChange = (value: string) => {
    router.push(`/settings/sessions/history?type=${value}`);
  };

  return (
    <>
      <h1>Session History</h1>
      {userInfo && (
        <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <Tabs.List>
              <Tabs.Trigger value="web">Web sessions</Tabs.Trigger>
              <Tabs.Trigger value="notebook">Notebook sessions</Tabs.Trigger>
              <Tabs.Trigger value="internal">Internal tokens</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="web">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <TokenHistoryView
                  username={userInfo.username}
                  initialTokenType={mapTabTypeToTokenType('web')}
                  showFilters={true}
                />
              </div>
            </Tabs.Content>

            <Tabs.Content value="notebook">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <TokenHistoryView
                  username={userInfo.username}
                  initialTokenType={mapTabTypeToTokenType('notebook')}
                  showFilters={true}
                />
              </div>
            </Tabs.Content>

            <Tabs.Content value="internal">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <TokenHistoryView
                  username={userInfo.username}
                  initialTokenType={mapTabTypeToTokenType('internal')}
                  showFilters={true}
                />
              </div>
            </Tabs.Content>
          </Tabs>
        </div>
      )}
    </>
  );
}
