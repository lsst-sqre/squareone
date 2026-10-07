import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata can run without the
// filesystem-backed config.
vi.mock('../../../lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// The page body is stubbed: this suite covers the route's metadata and that
// it renders the client, whose states DiscoveryPageClient's own tests cover.
vi.mock('./DiscoveryPageClient', () => ({
  default: () => <div>Service discovery page body</div>,
}));

import type { StaticConfig } from '../../../lib/config/resolveConfigDefaults';
// Import after mocking.
import { getStaticConfig } from '../../../lib/config/rsc';
import DiscoveryPage, { generateMetadata } from './page';

function makeConfig(overrides: Partial<StaticConfig> = {}): StaticConfig {
  return {
    siteName: 'Rubin Science Platform',
    ...overrides,
  } as StaticConfig;
}

describe('DiscoveryPage generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sets the page title from config.siteName', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Service discovery | Rubin Science Platform');
  });

  test('uses the configured siteName when it differs', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ siteName: 'Telescope Ops' })
    );

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Service discovery | Telescope Ops');
  });
});

describe('DiscoveryPage', () => {
  test('renders the discovery page client', () => {
    render(<DiscoveryPage />);

    expect(screen.getByText('Service discovery page body')).toBeInTheDocument();
  });
});
