'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AuthRequired from '../../../../components/AuthRequired';
import TokenDetailsView from '../../../../components/TokenDetails';
import { useRepertoireUrl } from '../../../../hooks/useRepertoireUrl';

type TokenDetailPageClientProps = {
  tokenKey: string;
};

export default function TokenDetailPageClient({
  tokenKey,
}: TokenDetailPageClientProps) {
  return (
    <AuthRequired>
      <TokenDetailContent tokenKey={tokenKey} />
    </AuthRequired>
  );
}

type TokenDetailContentProps = {
  tokenKey: string;
};

function TokenDetailContent({ tokenKey }: TokenDetailContentProps) {
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
        <h1>Invalid Token ID</h1>
        <p>
          The token ID in the URL is invalid. Please check the URL and try
          again.
        </p>
      </>
    );
  }

  // Loading state
  if (loginLoading) {
    return (
      <>
        <h1>Token Details</h1>
        <p>Loading...</p>
      </>
    );
  }

  // Error state
  if (loginError || !loginInfo) {
    return (
      <>
        <h1>Token Details</h1>
        <p>
          Failed to load authentication information. Please refresh the page or{' '}
          <Link href="/login">log in again</Link>.
        </p>
      </>
    );
  }

  const handleDeleteSuccess = () => {
    // Redirect to token list after successful deletion
    router.push('/settings/tokens');
  };

  return (
    <>
      <h1>Token Details</h1>
      <TokenDetailsView
        username={loginInfo.username}
        tokenKey={tokenKey}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
}
