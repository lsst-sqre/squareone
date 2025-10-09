import React from 'react';
import useUserTokens, { type TokenInfo } from '../../hooks/useUserTokens';
import AccessTokenItem from './AccessTokenItem';
import styles from './AccessTokensView.module.css';

type AccessTokensViewProps = {
  username: string;
};

export default function AccessTokensView({ username }: AccessTokensViewProps) {
  const { tokens, error, isLoading } = useUserTokens(username);

  // Filter to user tokens only and sort by created (most recent first)
  const userTokens = tokens
    ?.filter((token) => token.token_type === 'user')
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

  // Don't render if there are no user tokens
  if (!userTokens || userTokens.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {userTokens.map((token) => (
        <AccessTokenItem key={token.token} token={token} username={username} />
      ))}
    </div>
  );
}
