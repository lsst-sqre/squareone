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
const ALL_ADMIN_SCOPES = [
  'admin:notifications',
  'admin:token',
  'admin:oidc',
  'exec:admin',
];

/** The ungated Overview item that leads every admin user's sidebar. */
const OVERVIEW = { href: '/admin', label: 'Overview' };

test('generates a single flat section with every admin item in order', () => {
  const navigation = getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES);

  expect(navigation).toHaveLength(1);
  expect(navigation[0]).toEqual({
    items: [
      OVERVIEW,
      { href: '/admin/notifications', label: 'User notifications' },
      { href: '/admin/service-tokens', label: 'Service tokens' },
      { href: '/admin/oidc-clients', label: 'OIDC clients' },
      { href: '/admin/sentry', label: 'Sentry' },
    ],
  });
});

test('places OIDC clients immediately after Service tokens', () => {
  const hrefs = getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES)[0].items.map(
    (item) => item.href
  );

  expect(hrefs.indexOf('/admin/oidc-clients')).toBe(
    hrefs.indexOf('/admin/service-tokens') + 1
  );
});

test('shows Overview and OIDC clients for a user holding admin:oidc alone', () => {
  const navigation = getAdminNavigation(baseConfig, ['admin:oidc']);

  expect(navigation).toEqual([
    {
      items: [OVERVIEW, { href: '/admin/oidc-clients', label: 'OIDC clients' }],
    },
  ]);
});

test('keeps Overview first for every admin user', () => {
  const navigation = getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES);

  expect(navigation[0].items[0]).toEqual(OVERVIEW);
});

test('shows the ungated Overview to a user holding only one page scope', () => {
  // Overview has no page id: the layout's any-admin gate is its only gate, so
  // it does not depend on which page scope the user holds.
  for (const scope of ALL_ADMIN_SCOPES) {
    const items = getAdminNavigation(baseConfig, [scope]).flatMap(
      (section) => section.items
    );

    expect(items[0]).toEqual(OVERVIEW);
    expect(items).toHaveLength(2);
  }
});

test('places User notifications first among the gated pages', () => {
  const navigation = getAdminNavigation(baseConfig, ALL_ADMIN_SCOPES);

  expect(navigation[0].items[1]).toEqual({
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

test('shows Overview and Service tokens for a user holding admin:token alone', () => {
  const navigation = getAdminNavigation(baseConfig, ['admin:token']);

  expect(navigation).toEqual([
    {
      items: [
        OVERVIEW,
        { href: '/admin/service-tokens', label: 'Service tokens' },
      ],
    },
  ]);
});

test('shows Overview and User notifications for a user holding admin:notifications alone', () => {
  const navigation = getAdminNavigation(baseConfig, ['admin:notifications']);

  expect(navigation).toEqual([
    {
      items: [
        OVERVIEW,
        { href: '/admin/notifications', label: 'User notifications' },
      ],
    },
  ]);
});

test('shows Overview and Sentry for a user holding exec:admin alone', () => {
  // exec:admin is the default scope for the Sentry page only — it is no longer
  // a blanket admin scope.
  const navigation = getAdminNavigation(baseConfig, ['exec:admin']);

  expect(navigation).toEqual([
    { items: [OVERVIEW, { href: '/admin/sentry', label: 'Sentry' }] },
  ]);
});

test('hides every gated page from a user with no admin scopes', () => {
  // Only the ungated items remain. Such a user never sees the sidebar: the
  // admin layout's AdminRequired gate turns them away first.
  const navigation = getAdminNavigation(baseConfig, [
    'read:tap',
    'exec:notebook',
  ]);

  expect(navigation).toEqual([{ items: [OVERVIEW] }]);
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
    '/admin',
    '/admin/notifications',
    '/admin/service-tokens',
    '/admin/oidc-clients',
  ]);
});

test('hides OIDC clients in an environment that switches the page off', () => {
  // An environment without Gafaelfawr's OpenID Connect server sets
  // `oidcClients: []` rather than shipping a nav item that only ever leads to
  // the not-configured note.
  const config: AppConfigContextValue = {
    ...baseConfig,
    adminPageScopes: { oidcClients: [] },
  };

  const items = getAdminNavigation(config, ALL_ADMIN_SCOPES).flatMap(
    (section) => section.items
  );

  expect(items.map((item) => item.href)).not.toContain('/admin/oidc-clients');
});
