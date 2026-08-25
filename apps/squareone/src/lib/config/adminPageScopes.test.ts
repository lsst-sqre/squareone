import { describe, expect, test } from 'vitest';

import {
  ADMIN_PAGE_IDS,
  type AdminPageScopesConfig,
  DEFAULT_ADMIN_PAGE_SCOPES,
  getRequiredAdminScopes,
  hasAdminPageAccess,
  hasAnyAdminAccess,
  resolveAdminPageScopes,
} from './adminPageScopes';

describe('ADMIN_PAGE_IDS', () => {
  test('is the fixed set of scope-gated admin page ids', () => {
    expect([...ADMIN_PAGE_IDS]).toEqual([
      'notifications',
      'serviceTokens',
      'oidcClients',
      'sentry',
    ]);
  });

  test('every page id has a baked-in default scope list', () => {
    for (const pageId of ADMIN_PAGE_IDS) {
      expect(DEFAULT_ADMIN_PAGE_SCOPES[pageId]).toEqual(expect.any(Array));
    }
  });
});

describe('resolveAdminPageScopes', () => {
  test('falls back to the baked-in defaults when the config omits adminPageScopes', () => {
    expect(resolveAdminPageScopes({})).toEqual({
      notifications: ['admin:notifications'],
      serviceTokens: ['admin:token'],
      oidcClients: ['admin:oidc'],
      sentry: ['exec:admin'],
    });
  });

  test('uses the defaults when there is no config at all', () => {
    expect(resolveAdminPageScopes(undefined)).toEqual(
      DEFAULT_ADMIN_PAGE_SCOPES
    );
  });

  test('overrides only the pages the config names, defaulting the rest', () => {
    const resolved = resolveAdminPageScopes({
      adminPageScopes: { serviceTokens: ['admin:token', 'exec:admin'] },
    });

    expect(resolved.serviceTokens).toEqual(['admin:token', 'exec:admin']);
    expect(resolved.notifications).toEqual(['admin:notifications']);
    expect(resolved.sentry).toEqual(['exec:admin']);
  });

  test('preserves an explicitly-configured empty list instead of defaulting it', () => {
    // An empty list is the supported way to switch a page off for an
    // environment, so it must not be read as "unset".
    const resolved = resolveAdminPageScopes({
      adminPageScopes: { sentry: [] },
    });

    expect(resolved.sentry).toEqual([]);
  });
});

describe('hasAdminPageAccess', () => {
  test('grants access when the user holds the page scope', () => {
    expect(hasAdminPageAccess({}, ['admin:token'], 'serviceTokens')).toBe(true);
  });

  test('denies access when the user holds no scope for the page', () => {
    expect(hasAdminPageAccess({}, ['admin:token'], 'notifications')).toBe(
      false
    );
  });

  test('is any-of across the configured scopes', () => {
    const config = {
      adminPageScopes: { sentry: ['exec:admin', 'admin:observability'] },
    };

    expect(hasAdminPageAccess(config, ['admin:observability'], 'sentry')).toBe(
      true
    );
  });

  test('denies every user when the page is configured with an empty scope list', () => {
    const config: AdminPageScopesConfig = { adminPageScopes: { sentry: [] } };

    expect(hasAdminPageAccess(config, ['exec:admin'], 'sentry')).toBe(false);
  });

  test('honors a configured override rather than the default scope', () => {
    const config = { adminPageScopes: { notifications: ['exec:admin'] } };

    expect(
      hasAdminPageAccess(config, ['admin:notifications'], 'notifications')
    ).toBe(false);
    expect(hasAdminPageAccess(config, ['exec:admin'], 'notifications')).toBe(
      true
    );
  });
});

describe('hasAnyAdminAccess', () => {
  test('is true when the user can reach at least one admin page', () => {
    expect(hasAnyAdminAccess({}, ['admin:notifications'])).toBe(true);
  });

  test('is false for a user holding no admin page scope', () => {
    expect(hasAnyAdminAccess({}, ['read:tap', 'exec:notebook'])).toBe(false);
  });

  test('is false for a user with no scopes at all', () => {
    expect(hasAnyAdminAccess({}, [])).toBe(false);
  });

  test('is false when every page is configured with an empty scope list', () => {
    const config: AdminPageScopesConfig = {
      adminPageScopes: {
        notifications: [],
        serviceTokens: [],
        oidcClients: [],
        sentry: [],
      },
    };

    expect(hasAnyAdminAccess(config, ['exec:admin', 'admin:token'])).toBe(
      false
    );
  });
});

describe('getRequiredAdminScopes', () => {
  test("returns one page's configured scopes when given a page id", () => {
    expect(getRequiredAdminScopes({}, 'serviceTokens')).toEqual([
      'admin:token',
    ]);
  });

  test("returns the union of every page's scopes when given no page id", () => {
    expect(getRequiredAdminScopes({})).toEqual([
      'admin:notifications',
      'admin:token',
      'admin:oidc',
      'exec:admin',
    ]);
  });

  test('lists a scope shared by several pages only once', () => {
    const config: AdminPageScopesConfig = {
      adminPageScopes: {
        notifications: ['exec:admin'],
        serviceTokens: ['exec:admin', 'admin:token'],
      },
    };

    expect(getRequiredAdminScopes(config)).toEqual([
      'exec:admin',
      'admin:token',
      'admin:oidc',
    ]);
  });

  test('is empty when every page is configured with an empty scope list', () => {
    const config: AdminPageScopesConfig = {
      adminPageScopes: {
        notifications: [],
        serviceTokens: [],
        oidcClients: [],
        sentry: [],
      },
    };

    expect(getRequiredAdminScopes(config)).toEqual([]);
  });
});
