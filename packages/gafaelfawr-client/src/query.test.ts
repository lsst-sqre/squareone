/**
 * Tests for query helper classes.
 */
import { describe, expect, it } from 'vitest';

import { mockLoginInfo, mockTokens, mockUserInfo } from './mock-data';
import {
  createLoginInfoQuery,
  createTokenListQuery,
  createUserInfoQuery,
  LoginInfoQuery,
  TokenListQuery,
  UserInfoQuery,
} from './query';

describe('UserInfoQuery', () => {
  const query = createUserInfoQuery(mockUserInfo);

  it('provides access to username', () => {
    expect(query.username).toBe('testuser');
  });

  it('provides access to name', () => {
    expect(query.name).toBe('Test User');
  });

  it('provides access to email', () => {
    expect(query.email).toBe('testuser@example.com');
  });

  it('provides access to uid/gid', () => {
    expect(query.uid).toBe(1000);
    expect(query.gid).toBe(1000);
  });

  it('checks authentication status', () => {
    expect(query.isAuthenticated).toBe(true);

    const unauthQuery = createUserInfoQuery({ username: '', groups: [] });
    expect(unauthQuery.isAuthenticated).toBe(false);
  });

  it('gets group names', () => {
    const names = query.getGroupNames();
    expect(names).toContain('science');
    expect(names).toContain('developers');
  });

  it('checks group membership', () => {
    expect(query.isMemberOf('science')).toBe(true);
    expect(query.isMemberOf('nonexistent')).toBe(false);
  });

  it('gets notebook quota', () => {
    const quota = query.getNotebookQuota();
    expect(quota?.cpu).toBe(4);
    expect(quota?.memory).toBe(16);
  });

  it('checks notebook spawn permission', () => {
    expect(query.canSpawnNotebook()).toBe(true);
  });

  it('returns raw data', () => {
    expect(query.getRaw()).toEqual(mockUserInfo);
  });
});

describe('LoginInfoQuery', () => {
  const query = createLoginInfoQuery(mockLoginInfo);

  it('provides access to CSRF token', () => {
    expect(query.csrfToken).toBe(mockLoginInfo.csrf);
  });

  it('provides access to username', () => {
    expect(query.username).toBe('testuser');
  });

  it('provides access to scopes', () => {
    expect(query.scopes).toContain('read:tap');
    expect(query.scopes).toContain('exec:notebook');
  });

  it('checks scope presence', () => {
    expect(query.hasScope('read:tap')).toBe(true);
    expect(query.hasScope('admin:token')).toBe(false);
  });

  it('gets available scopes', () => {
    const available = query.getAvailableScopes();
    expect(available).toHaveLength(5);
    expect(available[0].name).toBe('read:tap');
    expect(available[0].description).toBeTruthy();
  });

  it('gets scope description', () => {
    expect(query.getScopeDescription('read:tap')).toBe('Query TAP services');
    expect(query.getScopeDescription('nonexistent')).toBeNull();
  });

  it('returns raw data', () => {
    expect(query.getRaw()).toEqual(mockLoginInfo);
  });
});

describe('TokenListQuery', () => {
  const query = createTokenListQuery(mockTokens);

  it('gets all tokens', () => {
    expect(query.getAll()).toHaveLength(mockTokens.length);
  });

  it('gets token count', () => {
    expect(query.count).toBe(mockTokens.length);
  });

  it('filters by type', () => {
    const sessionTokens = query.filterByType('session');
    expect(sessionTokens.length).toBeGreaterThan(0);
    expect(sessionTokens.every((t) => t.token_type === 'session')).toBe(true);
  });

  it('gets user tokens', () => {
    const userTokens = query.getUserTokens();
    expect(userTokens.length).toBeGreaterThan(0);
    expect(userTokens.every((t) => t.token_type === 'user')).toBe(true);
  });

  it('gets session tokens', () => {
    const sessionTokens = query.getSessionTokens();
    expect(sessionTokens.length).toBeGreaterThan(0);
    expect(sessionTokens.every((t) => t.token_type === 'session')).toBe(true);
  });

  it('gets token names', () => {
    const names = query.getTokenNames();
    expect(names).toContain('TAP access token');
    expect(names).toContain('CI Pipeline Token');
    // Should not include null names
    expect(names.length).toBeLessThan(mockTokens.length);
  });

  it('finds token by key', () => {
    const token = query.findByKey(mockTokens[0].token);
    expect(token).toBeDefined();
    expect(token?.token).toBe(mockTokens[0].token);

    expect(query.findByKey('nonexistent')).toBeUndefined();
  });

  it('finds token by name', () => {
    const token = query.findByName('TAP access token');
    expect(token).toBeDefined();
    expect(token?.token_name).toBe('TAP access token');

    expect(query.findByName('nonexistent')).toBeUndefined();
  });

  it('finds expiring soon tokens', () => {
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const expiringSoon = query.getExpiringSoon(oneWeekMs);

    // Session token expires in 6 days, should be in list
    expect(expiringSoon.some((t) => t.token_type === 'session')).toBe(true);

    // Tokens with no expiration or far future should not be included
    expect(expiringSoon.every((t) => t.expires !== null)).toBe(true);
  });

  it('gets expired tokens', () => {
    // Our mock data doesn't have expired tokens currently
    const expired = query.getExpired();
    // This should be empty for fresh mock data
    expect(Array.isArray(expired)).toBe(true);
  });

  it('handles empty token list', () => {
    const emptyQuery = createTokenListQuery([]);
    expect(emptyQuery.count).toBe(0);
    expect(emptyQuery.getAll()).toEqual([]);
    expect(emptyQuery.getUserTokens()).toEqual([]);
    expect(emptyQuery.getTokenNames()).toEqual([]);
  });
});

describe('Factory functions', () => {
  it('createUserInfoQuery returns UserInfoQuery instance', () => {
    const query = createUserInfoQuery(mockUserInfo);
    expect(query).toBeInstanceOf(UserInfoQuery);
  });

  it('createLoginInfoQuery returns LoginInfoQuery instance', () => {
    const query = createLoginInfoQuery(mockLoginInfo);
    expect(query).toBeInstanceOf(LoginInfoQuery);
  });

  it('createTokenListQuery returns TokenListQuery instance', () => {
    const query = createTokenListQuery(mockTokens);
    expect(query).toBeInstanceOf(TokenListQuery);
  });
});
