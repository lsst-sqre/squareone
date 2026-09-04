/**
 * Tests for query key factory.
 */
import { describe, expect, it } from 'vitest';

import { gafaelfawrKeys } from './query-keys';

describe('gafaelfawrKeys', () => {
  describe('all', () => {
    it('returns root key', () => {
      expect(gafaelfawrKeys.all).toEqual(['gafaelfawr']);
    });
  });

  describe('userInfo', () => {
    it('returns user info key', () => {
      expect(gafaelfawrKeys.userInfo()).toEqual(['gafaelfawr', 'user-info']);
    });

    it('includes root key', () => {
      expect(gafaelfawrKeys.userInfo()[0]).toBe('gafaelfawr');
    });
  });

  describe('loginInfo', () => {
    it('returns login info key', () => {
      expect(gafaelfawrKeys.loginInfo()).toEqual(['gafaelfawr', 'login-info']);
    });
  });

  describe('tokens', () => {
    it('returns tokens root key', () => {
      expect(gafaelfawrKeys.tokens()).toEqual(['gafaelfawr', 'tokens']);
    });
  });

  describe('tokensList', () => {
    it('returns tokens list key with username', () => {
      expect(gafaelfawrKeys.tokensList('testuser')).toEqual([
        'gafaelfawr',
        'tokens',
        'list',
        'testuser',
      ]);
    });

    it('handles different usernames', () => {
      expect(gafaelfawrKeys.tokensList('user1')).not.toEqual(
        gafaelfawrKeys.tokensList('user2')
      );
    });
  });

  describe('tokenDetail', () => {
    it('returns token detail key', () => {
      expect(gafaelfawrKeys.tokenDetail('testuser', 'abc123')).toEqual([
        'gafaelfawr',
        'tokens',
        'detail',
        'testuser',
        'abc123',
      ]);
    });
  });

  describe('tokenHistory', () => {
    it('returns token history root key', () => {
      expect(gafaelfawrKeys.tokenHistory()).toEqual([
        'gafaelfawr',
        'token-history',
      ]);
    });
  });

  describe('tokenHistoryList', () => {
    it('returns history list key with username', () => {
      expect(gafaelfawrKeys.tokenHistoryList('testuser')).toEqual([
        'gafaelfawr',
        'token-history',
        'testuser',
        {},
      ]);
    });

    it('includes filters in key', () => {
      const filters = { tokenType: 'user', limit: 20 };
      expect(gafaelfawrKeys.tokenHistoryList('testuser', filters)).toEqual([
        'gafaelfawr',
        'token-history',
        'testuser',
        filters,
      ]);
    });

    it('different filters produce different keys', () => {
      const key1 = gafaelfawrKeys.tokenHistoryList('testuser', { limit: 10 });
      const key2 = gafaelfawrKeys.tokenHistoryList('testuser', { limit: 20 });
      expect(key1).not.toEqual(key2);
    });
  });

  describe('oidcClients', () => {
    it('keys the list by the resolved Gafaelfawr base URL', () => {
      expect(gafaelfawrKeys.oidcClients('/auth/api/v1')).toEqual([
        'gafaelfawr',
        'oidc-clients',
        '/auth/api/v1',
      ]);
    });

    it('separates deployments', () => {
      expect(gafaelfawrKeys.oidcClients('/auth/api/v1')).not.toEqual(
        gafaelfawrKeys.oidcClients('https://data-dev.example.org/auth/api/v1')
      );
    });
  });

  describe('oidcClient', () => {
    it('keys a detail by base URL and client id', () => {
      expect(gafaelfawrKeys.oidcClient('/auth/api/v1', 'abc')).toEqual([
        'gafaelfawr',
        'oidc-client',
        '/auth/api/v1',
        'abc',
      ]);
    });

    it('is not a prefix match of the list key', () => {
      const list = gafaelfawrKeys.oidcClients('/auth/api/v1');
      const detail = gafaelfawrKeys.oidcClient('/auth/api/v1', 'abc');
      expect(detail.slice(0, list.length)).not.toEqual(list);
    });
  });

  describe('key hierarchy', () => {
    it('user info key starts with all key', () => {
      expect(gafaelfawrKeys.userInfo().slice(0, 1)).toEqual(gafaelfawrKeys.all);
    });

    it('tokens list key starts with tokens key', () => {
      expect(gafaelfawrKeys.tokensList('user').slice(0, 2)).toEqual(
        gafaelfawrKeys.tokens()
      );
    });

    it('token detail key starts with tokens key', () => {
      expect(gafaelfawrKeys.tokenDetail('user', 'key').slice(0, 2)).toEqual(
        gafaelfawrKeys.tokens()
      );
    });

    it('history list key starts with history key', () => {
      expect(gafaelfawrKeys.tokenHistoryList('user').slice(0, 2)).toEqual(
        gafaelfawrKeys.tokenHistory()
      );
    });

    it('oidc keys start with the root key', () => {
      expect(gafaelfawrKeys.oidcClients('/auth/api/v1').slice(0, 1)).toEqual(
        gafaelfawrKeys.all
      );
      expect(
        gafaelfawrKeys.oidcClient('/auth/api/v1', 'abc').slice(0, 1)
      ).toEqual(gafaelfawrKeys.all);
    });
  });
});
