import { type TokenType, useUserTokens } from '@lsst-sqre/gafaelfawr-client';
import React from 'react';

import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import AccessTokenItem from './AccessTokenItem';
import styles from './AccessTokensView.module.css';

type AccessTokensViewProps = {
  username: string;
  /**
   * Which token type to list. Defaults to `'user'` (the user-token settings
   * page); the admin service-token page passes `'service'` to list a bot user's
   * service tokens.
   */
  tokenType?: TokenType;
  /**
   * Optional node rendered when the user has no tokens of {@link tokenType}.
   * Defaults to rendering nothing (the settings page's behavior); the admin
   * manage section passes a message so a lookup that finds nothing still gives
   * feedback.
   */
  emptyState?: React.ReactNode;
};

export default function AccessTokensView({
  username,
  tokenType = 'user',
  emptyState = null,
}: AccessTokensViewProps) {
  const repertoireUrl = useRepertoireUrl();
  const { tokens, error, isLoading } = useUserTokens(username, repertoireUrl);

  // Filter to the requested token type and sort by created (most recent first)
  const matchingTokens = tokens
    ?.filter((token) => token.token_type === tokenType)
    .sort((a, b) => {
      const aCreated = a.created ?? 0;
      const bCreated = b.created ?? 0;
      return bCreated - aCreated;
    });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading tokens...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Failed to load tokens: {error.message}
        </div>
      </div>
    );
  }

  // No matching tokens: render the caller's empty state (default: nothing).
  if (!matchingTokens || matchingTokens.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className={styles.container}>
      {matchingTokens.map((token) => (
        <AccessTokenItem key={token.token} token={token} username={username} />
      ))}
    </div>
  );
}
