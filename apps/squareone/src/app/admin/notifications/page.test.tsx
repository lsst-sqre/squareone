import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata can run without the
// filesystem-backed config.
vi.mock('../../../lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// Import after mocking.
import type { StaticConfig } from '../../../lib/config/resolveConfigDefaults';
import { getStaticConfig } from '../../../lib/config/rsc';
import { generateMetadata } from './page';

function makeConfig(overrides: Partial<StaticConfig> = {}): StaticConfig {
  return {
    siteName: 'Rubin Science Platform',
    ...overrides,
  } as StaticConfig;
}

describe('NotificationsPage generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sets the page title from config.siteName', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('User notifications | Rubin Science Platform');
  });

  test('uses the configured siteName when it differs', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ siteName: 'Telescope Ops' })
    );

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('User notifications | Telescope Ops');
  });
});
