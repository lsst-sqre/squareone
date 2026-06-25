import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata and the flag gate can run
// without the filesystem-backed config.
vi.mock('../../lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// Mock next/navigation's notFound so we can assert it is called (and have it
// halt execution by throwing, as the real App Router implementation does).
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

// Import after mocking.
import { notFound } from 'next/navigation';
import type { AppConfig } from '../../lib/config/loader';
import { getStaticConfig } from '../../lib/config/rsc';
import NotificationsPage, { generateMetadata } from './page';

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    siteName: 'Rubin Science Platform',
    enableUserNotifications: true,
    ...overrides,
  } as AppConfig;
}

describe('NotificationsPage generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sets the page title from config.siteName', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Notifications | Rubin Science Platform');
  });

  test('uses the configured siteName when it differs', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ siteName: 'Telescope Ops' })
    );

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Notifications | Telescope Ops');
  });
});

describe('NotificationsPage flag gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns 404 when the feature flag is off', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ enableUserNotifications: false })
    );

    await expect(NotificationsPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  test('renders the page when the feature flag is on', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ enableUserNotifications: true })
    );

    const result = await NotificationsPage();

    expect(notFound).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
});
