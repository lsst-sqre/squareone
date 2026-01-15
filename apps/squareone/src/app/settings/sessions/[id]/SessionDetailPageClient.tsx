'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AuthRequired from '../../../../components/AuthRequired';
import TokenDetailsView from '../../../../components/TokenDetails';
import { useRepertoireUrl } from '../../../../hooks/useRepertoireUrl';

type SessionDetailPageClientProps = {
  tokenKey: string;
};

export default function SessionDetailPageClient({
  tokenKey,
}: SessionDetailPageClientProps) {
  return (
    <AuthRequired>
      <SessionDetailContent tokenKey={tokenKey} />
    </AuthRequired>
  );
}

type SessionDetailContentProps = {
  tokenKey: string;
};

function SessionDetailContent({ tokenKey }: SessionDetailContentProps) {
  const router = useRouter();
  const repertoireUrl = useRepertoireUrl();
  const {
    loginInfo,
    error: loginError,
    isLoading: loginLoading,
  } = useLoginInfo(repertoireUrl);

  // Handle invalid token ID
  if (!tokenKey) {
    return (
      <>
        <h1>Invalid Session Token ID</h1>
        <p>
          The session token ID in the URL is invalid. Please check the URL and
          try again.
        </p>
      </>
    );
  }

  // Loading state
  if (loginLoading) {
    return (
      <>
        <h1>Session Token Details</h1>
        <p>Loading...</p>
      </>
    );
  }

  // Error state
  if (loginError || !loginInfo) {
    return (
      <>
        <h1>Session Token Details</h1>
        <p>
          Failed to load authentication information. Please refresh the page or{' '}
          <Link href="/login">log in again</Link>.
        </p>
      </>
    );
  }

  const handleDeleteSuccess = () => {
    // Redirect to session tokens list after successful deletion
    router.push('/settings/sessions');
  };

  return (
    <>
      <h1>Session Token Details</h1>
      <TokenDetailsView
        username={loginInfo.username}
        tokenKey={tokenKey}
        onDeleteSuccess={handleDeleteSuccess}
        returnUrl="/settings/sessions"
      />
    </>
  );
}
