import React from 'react';
import useUserTokens, { type TokenInfo } from '../../hooks/useUserTokens';
import SessionTokenItem from './SessionTokenItem';
import styles from './SessionTokensView.module.css';

type SessionTokensViewProps = {
  username: string;
  tokenType: 'session' | 'notebook' | 'internal';
};

export default function SessionTokensView({
  username,
  tokenType,
}: SessionTokensViewProps) {
  const { tokens, error, isLoading } = useUserTokens(username);

  // Filter to specified token type and sort by created (most recent first)
  const sessionTokens = tokens
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

  // Don't render if there are no session tokens of this type
  if (!sessionTokens || sessionTokens.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {sessionTokens.map((token) => (
        <SessionTokenItem key={token.token} token={token} username={username} />
      ))}
    </div>
  );
}
