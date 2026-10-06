import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata can run without the
// filesystem-backed config.
vi.mock('../../lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// The overview reads service discovery from Repertoire.
vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(),
}));

vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  useServiceDiscovery: vi.fn(),
}));

// `/admin` used to redirect to the first visible admin page; spy on the router
// to show it no longer does.
const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

import {
  createDiscoveryQuery,
  mockDiscoveryDataDev,
  useServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
// Import after mocking.
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import type { StaticConfig } from '../../lib/config/resolveConfigDefaults';
import { getStaticConfig } from '../../lib/config/rsc';
import AdminPage, { generateMetadata } from './page';

function makeConfig(overrides: Partial<StaticConfig> = {}): StaticConfig {
  return {
    siteName: 'Rubin Science Platform',
    ...overrides,
  } as StaticConfig;
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

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the environment overview instead of redirecting', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(
      'https://data-dev.lsst.cloud/repertoire'
    );
    vi.mocked(useServiceDiscovery).mockReturnValue({
      discovery: mockDiscoveryDataDev,
      query: createDiscoveryQuery(mockDiscoveryDataDev),
      refetch: vi.fn(),
      isStale: false,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useServiceDiscovery>);

    render(<AdminPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Overview' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'SQuaRE RSP development' })
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  test('says service discovery is not configured when repertoireUrl is unset', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    // Without a URL the discovery query is disabled and stays pending.
    vi.mocked(useServiceDiscovery).mockReturnValue({
      discovery: undefined,
      query: null,
      refetch: vi.fn(),
      isStale: false,
      isPending: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useServiceDiscovery>);

    render(<AdminPage />);

    expect(
      screen.getByText(
        /service discovery is not configured for this environment/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Overview' })
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
