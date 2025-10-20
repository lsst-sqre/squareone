import { expect, test } from 'vitest';
import { getSettingsNavigation } from './settingsNavigation';
import type { AppConfigContextValue } from '../../contexts/AppConfigContext';

// Mock AppConfig configurations for testing
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

// Test configuration for settings navigation with sessions

test('generates navigation with Account, Access Tokens, and Sessions', () => {
  const navigation = getSettingsNavigation(baseConfig);

  expect(navigation).toHaveLength(1);

  // Only section: Account, Access Tokens, and Sessions (no label)
  expect(navigation[0]).toEqual({
    items: [
      { href: '/settings', label: 'Account' },
      { href: '/settings/tokens', label: 'Access tokens' },
      { href: '/settings/sessions', label: 'Sessions' },
    ],
  });
});

test('all navigation items have required href and label properties', () => {
  const navigation = getSettingsNavigation(baseConfig);

  navigation.forEach((section) => {
    section.items.forEach((item) => {
      expect(item).toHaveProperty('href');
      expect(item).toHaveProperty('label');
      expect(typeof item.href).toBe('string');
      expect(typeof item.label).toBe('string');
      expect(item.href).toMatch(/^\/settings/); // All hrefs should start with /settings
    });
  });
});

test('sections without labels have correct structure', () => {
  const navigation = getSettingsNavigation(baseConfig);

  // Account and Access Tokens section should not have a label
  expect(navigation[0]).not.toHaveProperty('label');
});

test('function is pure - multiple calls with same config return identical results', () => {
  const navigation1 = getSettingsNavigation(baseConfig);
  const navigation2 = getSettingsNavigation(baseConfig);
  const navigation3 = getSettingsNavigation(baseConfig);

  expect(navigation1).toEqual(navigation2);
  expect(navigation2).toEqual(navigation3);
});

test('function handles various config properties without side effects', () => {
  // Test with different non-relevant config properties to ensure they don't affect navigation
  const configVariation1: AppConfigContextValue = {
    ...baseConfig,
    siteName: 'Different Site Name',
    enableAppsMenu: true,
    showPreview: true,
  };

  const configVariation2: AppConfigContextValue = {
    ...baseConfig,
    baseUrl: 'https://production.example.com',
    environmentName: 'production',
  };

  const navigation1 = getSettingsNavigation(configVariation1);
  const navigation2 = getSettingsNavigation(configVariation2);
  const navigationOriginal = getSettingsNavigation(baseConfig);

  // All should be identical since navigation is static
  expect(navigation1).toEqual(navigationOriginal);
  expect(navigation2).toEqual(navigationOriginal);
});
