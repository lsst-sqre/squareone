import { TokenInfoSchema } from '@lsst-sqre/gafaelfawr-client';
import { afterEach, describe, expect, it } from 'vitest';

import {
  addDevUserToken,
  deleteDevUserToken,
  getDevUserTokenByKey,
  getDevUserTokens,
  resetDevUserTokens,
} from './userTokensStore';

afterEach(() => {
  resetDevUserTokens();
});

describe('userTokensStore', () => {
  it('seeds schema-valid tokens for a new username', () => {
    const tokens = getDevUserTokens('vera');

    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) {
      // Must satisfy the client schema so useUserTokens() parses them.
      expect(() => TokenInfoSchema.parse(token)).not.toThrow();
      expect(token.username).toBe('vera');
    }
  });

  it('returns tokens most-recently-created first', () => {
    const tokens = getDevUserTokens('vera');
    const created = tokens.map((token) => token.created ?? 0);
    const sorted = [...created].sort((a, b) => b - a);
    expect(created).toEqual(sorted);
  });

  it('isolates tokens per username', () => {
    const veraKeys = getDevUserTokens('vera').map((t) => t.token);
    addDevUserToken('someone-else', {
      token_name: 'Other user token',
      scopes: ['read:tap'],
    });

    // vera's collection is unaffected by another user's create.
    expect(getDevUserTokens('vera').map((t) => t.token)).toEqual(veraKeys);
  });

  it('looks up a seeded token by key', () => {
    const [first] = getDevUserTokens('vera');
    const found = getDevUserTokenByKey('vera', first.token);
    expect(found).toEqual(first);
  });

  it('returns undefined for an unknown key', () => {
    expect(
      getDevUserTokenByKey('vera', 'gtdoesnotexist1234567')
    ).toBeUndefined();
  });

  it('creates a token with a valid 22-character key and echoes the request', () => {
    const created = addDevUserToken('vera', {
      token_name: 'New token',
      scopes: ['read:tap', 'read:image'],
      expires: null,
    });

    expect(() => TokenInfoSchema.parse(created)).not.toThrow();
    expect(created.token).toHaveLength(22);
    expect(created.token_name).toBe('New token');
    expect(created.scopes).toEqual(['read:tap', 'read:image']);
    expect(created.token_type).toBe('user');

    // The created token is now listed and looked up by key.
    expect(getDevUserTokenByKey('vera', created.token)).toEqual(created);
    expect(getDevUserTokens('vera')[0]).toEqual(created);
  });

  it('generates collision-free keys across creates', () => {
    const a = addDevUserToken('vera', { token_name: 'a', scopes: [] });
    const b = addDevUserToken('vera', { token_name: 'b', scopes: [] });
    expect(a.token).not.toBe(b.token);
  });

  it('deletes a token by key and reports whether one was removed', () => {
    const [first] = getDevUserTokens('vera');

    expect(deleteDevUserToken('vera', first.token)).toBe(true);
    expect(getDevUserTokenByKey('vera', first.token)).toBeUndefined();

    // A second delete of the same key is a no-op.
    expect(deleteDevUserToken('vera', first.token)).toBe(false);
  });
});
