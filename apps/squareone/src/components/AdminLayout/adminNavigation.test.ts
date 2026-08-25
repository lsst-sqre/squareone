import { expect, test } from 'vitest';
import type { AppConfigContextValue } from '../../hooks/useStaticConfig';
import { getAdminNavigation } from './adminNavigation';

// Mock AppConfig configuration for testing
const baseConfig: AppConfigContextValue = {
  siteName: 'Rubin Science Platform',
  baseUrl: 'http://localhost:3000',
  environmentName: 'test',
  siteDescription: 'Test site description',
  docsBaseUrl: 'https://rsp.lsst.io',
  timesSquareUrl: 'http://localhost:3000/times-square/api',
  coManageRegistryUrl: 'https://id.lsst.cloud',
  enableAppsMenu: false,
  appLinks: [],
  showPreview: false,
  enableUserNotifications: false,
  userNotificationsPollIntervalSeconds: 300,
  mdxDir: 'src/content/pages',
};

/** Scopes covering every admin page that currently has a nav item. */
const ALL_ADMIN_SCOPES = ['admin:notifications', 'admin:token', 'exec:admin'];

test('generates a single flat section with the notification, service-token, and Sentry items in order', () => {
  const navigation = getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES);

  expect(navigation).toHaveLength(1);
  expect(navigation[0]).toEqual({
    items: [
      { href: '/admin/notifications', label: 'User notifications' },
      { href: '/admin/service-tokens', label: 'Service tokens' },
      { href: '/admin/sentry', label: 'Sentry' },
    ],
  });
});

test('keeps User notifications first so /admin redirects there', () => {
  const navigation = getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES);

  expect(navigation[0].items[0]).toEqual({
    href: '/admin/notifications',
    label: 'User notifications',
  });
});

test('keeps Sentry last', () => {
  const navigation = getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES);
  const { items } = navigation[0];

  expect(items[items.length - 1]).toEqual({
    href: '/admin/sentry',
    label: 'Sentry',
  });
});

test('the section is flat (no category label)', () => {
  const navigation = getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES);

  expect(navigation[0]).not.toHaveProperty('label');
});

test('all navigation items have string href and label under /admin', () => {
  const navigation = getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES);

  navigation.forEach((section) => {
    section.items.forEach((item) => {
      expect(typeof item.href).toBe('string');
      expect(typeof item.label).toBe('string');
      expect(item.href).toMatch(/^\/admin/);
    });
  });
});

test('function is pure - repeated calls return identical results', () => {
  expect(getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES)).toEqual(
    getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES)
  );
});

test('shows only Service tokens for a user holding admin:token alone', () => {
  const navigation = getAdminNavigation(baseConfig, ['admin:token']);

  expect(navigation).toEqual([
    { items: [{ href: '/admin/service-tokens', label: 'Service tokens' }] },
  ]);
});

test('shows only User notifications for a user holding admin:notifications alone', () => {
  const navigation = getAdminNavigation(baseConfig, ['admin:notifications']);

  expect(navigation).toEqual([
    {
      items: [{ href: '/admin/notifications', label: 'User notifications' }],
    },
  ]);
});

test('shows only Sentry for a user holding exec:admin alone', () => {
  // exec:admin is the default scope for the Sentry page only — it is no longer
  // a blanket admin scope.
  const navigation = getAdminNavigation(baseConfig, ['exec:admin']);

  expect(navigation).toEqual([
    { items: [{ href: '/admin/sentry', label: 'Sentry' }] },
  ]);
});

test('returns no sections for a user with no admin scopes', () => {
  const navigation = getAdminNavigation(baseConfig, [
    'read:tap',
    'exec:notebook',
  ]);

  expect(navigation).toEqual([]);
});

test('follows a configured scope override rather than the default', () => {
  const config: AppConfigContextValue = {
    ...baseConfig,
    adminPageScopes: { serviceTokens: ['exec:admin'] },
  };

  const items = getAdminNavigation(config, ['exec:admin']).flatMap(
    (section) => section.items
  );

  expect(items).toContainEqual({
    href: '/admin/service-tokens',
    label: 'Service tokens',
  });
});

test('hides a page configured with an empty scope list', () => {
  const config: AppConfigContextValue = {
    ...baseConfig,
    adminPageScopes: { sentry: [] },
  };

  const items = getAdminNavigation(config, ALL_ADMIN_SCOPES).flatMap(
    (section) => section.items
  );

  expect(items.map((item) => item.href)).toEqual([
    '/admin/notifications',
    '/admin/service-tokens',
  ]);
});

test('does not yet expose an OIDC clients item', () => {
  // The oidcClients page id and its default scope exist ahead of the page
  // itself; the nav item lands with the page.
  const items = getAdminNavigation(baseConfig, [
    ...ALL_ADMIN_SCOPES,
    'admin:oidc',
  ]).flatMap((section) => section.items);

  expect(items.map((item) => item.href)).not.toContain('/admin/oidc-clients');
});
