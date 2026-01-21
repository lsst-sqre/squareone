'use client';

import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import { Button, Tabs } from '@lsst-sqre/squared';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import AuthRequired from '../../../components/AuthRequired';
import SessionTokensView from '../../../components/SessionTokensView';
import { Lede } from '../../../components/Typography';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';

export default function SessionsPageClient() {
  return (
    <AuthRequired>
      <SessionsContent />
    </AuthRequired>
  );
}

function SessionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repertoireUrl = useRepertoireUrl();
  const { userInfo } = useUserInfo(repertoireUrl);

  // Get active tab from URL query parameter, default to 'web'
  const activeTab = searchParams.get('type') || 'web';

  // Handle tab change by updating URL query parameter
  const handleTabChange = (value: string) => {
    router.push(`/settings/sessions?type=${value}`);
  };

  return (
    <>
      <h1>Sessions</h1>
      <Lede>
        View and manage your web sessions, notebook sessions, and internal
        tokens.
      </Lede>

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
                <SessionTokensView
                  username={userInfo.username}
                  tokenType="session"
                  repertoireUrl={repertoireUrl}
                />
              </div>
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <Button
                  appearance="outline"
                  tone="secondary"
                  as={Link}
                  href="/settings/sessions/history?type=web"
                >
                  View history
                </Button>
              </div>
            </Tabs.Content>

            <Tabs.Content value="notebook">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <SessionTokensView
                  username={userInfo.username}
                  tokenType="notebook"
                  repertoireUrl={repertoireUrl}
                />
              </div>
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <Button
                  appearance="outline"
                  tone="secondary"
                  as={Link}
                  href="/settings/sessions/history?type=notebook"
                >
                  View history
                </Button>
              </div>
            </Tabs.Content>

            <Tabs.Content value="internal">
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <SessionTokensView
                  username={userInfo.username}
                  tokenType="internal"
                  repertoireUrl={repertoireUrl}
                />
              </div>
              <div style={{ marginTop: 'var(--sqo-space-lg-fixed)' }}>
                <Button
                  appearance="outline"
                  tone="secondary"
                  as={Link}
                  href="/settings/sessions/history?type=internal"
                >
                  View history
                </Button>
              </div>
            </Tabs.Content>
          </Tabs>
        </div>
      )}
    </>
  );
}
