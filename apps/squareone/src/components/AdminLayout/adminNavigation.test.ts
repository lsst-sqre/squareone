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

test('generates a single flat section with the notification, service-token, and Sentry items in order', () => {
  const navigation = getAdminNavigation(baseConfig);

  expect(navigation).toHaveLength(1);
  expect(navigation[0]).toEqual({
    items: [
      { href: '/admin/notifications', label: 'User notifications' },
      { href: '/admin/service-tokens', label: 'Service tokens' },
      { href: '/admin/sentry', label: 'Sentry' },
    ],
  });
});

test('includes the service-token admin item', () => {
  const navigation = getAdminNavigation(baseConfig);
  const items = navigation.flatMap((section) => section.items);

  expect(items).toContainEqual({
    href: '/admin/service-tokens',
    label: 'Service tokens',
  });
});

test('includes the user-notifications admin item', () => {
  const navigation = getAdminNavigation(baseConfig);
  const items = navigation.flatMap((section) => section.items);

  expect(items).toContainEqual({
    href: '/admin/notifications',
    label: 'User notifications',
  });
});

test('keeps User notifications first so /admin redirects there', () => {
  const navigation = getAdminNavigation(baseConfig);

  expect(navigation[0].items[0]).toEqual({
    href: '/admin/notifications',
    label: 'User notifications',
  });
});

test('keeps Sentry last', () => {
  const navigation = getAdminNavigation(baseConfig);
  const { items } = navigation[0];

  expect(items[items.length - 1]).toEqual({
    href: '/admin/sentry',
    label: 'Sentry',
  });
});

test('the section is flat (no category label)', () => {
  const navigation = getAdminNavigation(baseConfig);

  expect(navigation[0]).not.toHaveProperty('label');
});

test('all navigation items have string href and label under /admin', () => {
  const navigation = getAdminNavigation(baseConfig);

  navigation.forEach((section) => {
    section.items.forEach((item) => {
      expect(typeof item.href).toBe('string');
      expect(typeof item.label).toBe('string');
      expect(item.href).toMatch(/^\/admin/);
    });
  });
});

test('function is pure - repeated calls return identical results', () => {
  expect(getAdminNavigation(baseConfig)).toEqual(
    getAdminNavigation(baseConfig)
  );
});
