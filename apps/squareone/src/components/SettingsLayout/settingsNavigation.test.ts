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

const configWithSessionsVisible: AppConfigContextValue = {
  ...baseConfig,
  settingsSessionsVisible: true,
};

const configWithSessionsHidden: AppConfigContextValue = {
  ...baseConfig,
  settingsSessionsVisible: false,
};

const configWithSessionsUndefined: AppConfigContextValue = {
  ...baseConfig,
  // settingsSessionsVisible not defined - should default to showing sessions
};

test('generates navigation with Sessions visible when settingsSessionsVisible is true', () => {
  const navigation = getSettingsNavigation(configWithSessionsVisible);

  expect(navigation).toHaveLength(3);

  // First section: Account
  expect(navigation[0]).toEqual({
    items: [{ href: '/settings', label: 'Account' }],
  });

  // Second section: Access Tokens
  expect(navigation[1]).toEqual({
    items: [{ href: '/settings/tokens', label: 'Access Tokens' }],
  });

  // Third section: Security with Sessions
  expect(navigation[2]).toEqual({
    label: 'Security',
    items: [{ href: '/settings/sessions', label: 'Sessions' }],
  });
});

test('generates navigation without Sessions when settingsSessionsVisible is false', () => {
  const navigation = getSettingsNavigation(configWithSessionsHidden);

  expect(navigation).toHaveLength(2);

  // First section: Account
  expect(navigation[0]).toEqual({
    items: [{ href: '/settings', label: 'Account' }],
  });

  // Second section: Access Tokens
  expect(navigation[1]).toEqual({
    items: [{ href: '/settings/tokens', label: 'Access Tokens' }],
  });

  // Sessions section should not exist
  const hasSessionsSection = navigation.some((section) =>
    section.items?.some((item) => item.label === 'Sessions')
  );
  expect(hasSessionsSection).toBe(false);
});

test('generates navigation with Sessions when settingsSessionsVisible is undefined (default behavior)', () => {
  const navigation = getSettingsNavigation(configWithSessionsUndefined);

  expect(navigation).toHaveLength(3);

  // Should include the Sessions section by default
  expect(navigation[2]).toEqual({
    label: 'Security',
    items: [{ href: '/settings/sessions', label: 'Sessions' }],
  });
});

test('all navigation items have required href and label properties', () => {
  const navigation = getSettingsNavigation(configWithSessionsVisible);

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

test('navigation structure is consistent regardless of Sessions visibility', () => {
  const navigationVisible = getSettingsNavigation(configWithSessionsVisible);
  const navigationHidden = getSettingsNavigation(configWithSessionsHidden);

  // Both should have Account and Access Tokens sections
  expect(navigationVisible[0]).toEqual(navigationHidden[0]); // Account
  expect(navigationVisible[1]).toEqual(navigationHidden[1]); // Access Tokens

  // Only difference should be the presence/absence of Security section
  expect(navigationVisible).toHaveLength(3);
  expect(navigationHidden).toHaveLength(2);
});

test('Security section is properly structured when included', () => {
  const navigation = getSettingsNavigation(configWithSessionsVisible);
  const securitySection = navigation[2];

  expect(securitySection).toHaveProperty('label', 'Security');
  expect(securitySection).toHaveProperty('items');
  expect(securitySection.items).toHaveLength(1);
  expect(securitySection.items[0]).toEqual({
    href: '/settings/sessions',
    label: 'Sessions',
  });
});

test('navigation handles edge case where settingsSessionsVisible is explicitly set to true', () => {
  const navigation = getSettingsNavigation({
    ...baseConfig,
    settingsSessionsVisible: true,
  });

  expect(navigation).toHaveLength(3);
  const hasSessionsSection = navigation.some(
    (section) => section.label === 'Security'
  );
  expect(hasSessionsSection).toBe(true);
});

test('navigation handles edge case where settingsSessionsVisible is explicitly set to false', () => {
  const navigation = getSettingsNavigation({
    ...baseConfig,
    settingsSessionsVisible: false,
  });

  expect(navigation).toHaveLength(2);
  const hasSessionsSection = navigation.some(
    (section) => section.label === 'Security'
  );
  expect(hasSessionsSection).toBe(false);
});

test('sections without labels have correct structure', () => {
  const navigation = getSettingsNavigation(configWithSessionsVisible);

  // Account and Access Tokens sections should not have labels
  expect(navigation[0]).not.toHaveProperty('label');
  expect(navigation[1]).not.toHaveProperty('label');

  // But Security section should have a label
  expect(navigation[2]).toHaveProperty('label', 'Security');
});

test('function is pure - multiple calls with same config return identical results', () => {
  const navigation1 = getSettingsNavigation(configWithSessionsVisible);
  const navigation2 = getSettingsNavigation(configWithSessionsVisible);
  const navigation3 = getSettingsNavigation(configWithSessionsVisible);

  expect(navigation1).toEqual(navigation2);
  expect(navigation2).toEqual(navigation3);
});

test('function handles various config properties without side effects', () => {
  // Test with different non-relevant config properties to ensure they don't affect navigation
  const configVariation1: AppConfigContextValue = {
    ...configWithSessionsVisible,
    siteName: 'Different Site Name',
    enableAppsMenu: true,
    showPreview: true,
  };

  const configVariation2: AppConfigContextValue = {
    ...configWithSessionsVisible,
    baseUrl: 'https://production.example.com',
    environmentName: 'production',
  };

  const navigation1 = getSettingsNavigation(configVariation1);
  const navigation2 = getSettingsNavigation(configVariation2);
  const navigationOriginal = getSettingsNavigation(configWithSessionsVisible);

  // All should be identical since only settingsSessionsVisible affects navigation
  expect(navigation1).toEqual(navigationOriginal);
  expect(navigation2).toEqual(navigationOriginal);
});
