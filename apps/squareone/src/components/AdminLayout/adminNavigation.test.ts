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
  mdxDir: 'src/content/pages',
};

test('generates a single flat section with the Sentry item', () => {
  const navigation = getAdminNavigation(baseConfig);

  expect(navigation).toHaveLength(1);
  expect(navigation[0]).toEqual({
    items: [{ href: '/admin/sentry', label: 'Sentry' }],
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
