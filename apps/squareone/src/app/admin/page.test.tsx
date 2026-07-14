import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata and the page can run without
// the filesystem-backed config.
vi.mock('../../lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// Mock the admin navigation so the empty-nav fallback branch is exercisable.
vi.mock('../../components/AdminLayout/adminNavigation', () => ({
  getAdminNavigation: vi.fn(),
}));

// Import after mocking.
import { getAdminNavigation } from '../../components/AdminLayout/adminNavigation';
import type { AppConfig } from '../../lib/config/loader';
import { getStaticConfig } from '../../lib/config/rsc';
import AdminPage, { generateMetadata } from './page';

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    siteName: 'Rubin Science Platform',
    ...overrides,
  } as AppConfig;
}

describe('AdminPage generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sets the page title from config.siteName', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Admin | Rubin Science Platform');
  });

  test('uses the configured siteName when it differs', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ siteName: 'Telescope Ops' })
    );

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Admin | Telescope Ops');
  });
});

describe('AdminPage fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());
  });

  test('renders an h1 heading when there is no admin navigation to redirect to', async () => {
    // With an empty navigation, the page renders its fallback rather than
    // redirecting, so it needs a top-level heading like every other page.
    vi.mocked(getAdminNavigation).mockReturnValue([]);

    render(await AdminPage());

    expect(
      screen.getByRole('heading', { level: 1, name: /admin/i })
    ).toBeInTheDocument();
  });
});
