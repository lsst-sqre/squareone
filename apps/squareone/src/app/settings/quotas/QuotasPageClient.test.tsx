import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the hooks so the component renders without a ConfigProvider/Suspense
// boundary or live service discovery.
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useUserInfo: vi.fn(),
  useLoginInfo: vi.fn(),
}));

vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  useServiceDiscovery: vi.fn(),
}));

vi.mock('../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

vi.mock('../../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

import type { Quota, UseUserInfoReturn } from '@lsst-sqre/gafaelfawr-client';
// Import after mocking.
import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import {
  getEmptyDiscovery,
  mockDiscovery,
  ServiceDiscoveryQuery,
} from '@lsst-sqre/repertoire-client';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';
import { useStaticConfig } from '../../../hooks/useStaticConfig';
import type { StaticConfig } from '../../../lib/config/resolveConfigDefaults';
import { mockDiscoveryState } from '../../../tests/serviceAccessMocks';
import QuotasPageClient from './QuotasPageClient';

// Build a config object with only the fields the component reads, cast to the
// full StaticConfig shape.
function makeConfig(overrides: Partial<StaticConfig> = {}): StaticConfig {
  return {
    docsBaseUrl: 'https://rsp.lsst.io',
    ...overrides,
  } as StaticConfig;
}

// API quotas keyed by quota labels that the mock discovery describes.
const apiQuota: Quota = {
  api: { tap: 100, sia: 20, 'muster-quota': 5 },
  notebook: null,
  tap: {},
};

// Helper to create a logged-in useUserInfo return value so AuthRequired renders
// its children.
function makeUserInfoReturn(quota?: Quota): UseUserInfoReturn {
  return {
    userInfo: { username: 'testuser', groups: [], quota },
    query: null,
    isLoggedIn: true,
    isLoading: false,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  };
}

describe('QuotasPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    vi.mocked(useUserInfo).mockReturnValue(makeUserInfoReturn());
    vi.mocked(useStaticConfig).mockReturnValue(makeConfig());
    mockDiscoveryState();
  });

  test('composes the quotas docs link from a non-default docsBaseUrl', () => {
    vi.mocked(useStaticConfig).mockReturnValue(
      makeConfig({ docsBaseUrl: 'https://rsp.lsst.io/v/usdfprod' })
    );

    render(<QuotasPageClient />);

    const link = screen.getByRole('link', { name: 'Learn more about quotas' });
    expect(link).toHaveAttribute(
      'href',
      'https://rsp.lsst.io/v/usdfprod/guides/life/quotas.html'
    );
  });

  test('renders the quotas docs link in the same tab', () => {
    vi.mocked(useStaticConfig).mockReturnValue(makeConfig());

    render(<QuotasPageClient />);

    const link = screen.getByRole('link', { name: 'Learn more about quotas' });
    expect(link).not.toHaveAttribute('target');
  });

  test('labels rate limits from service discovery', () => {
    vi.mocked(useUserInfo).mockReturnValue(makeUserInfoReturn(apiQuota));

    render(<QuotasPageClient />);

    expect(
      screen.getByText('Table access protocol (TAP) — TAP API calls')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Simple image access (SIA) — Image requests')
    ).toBeInTheDocument();
    expect(screen.queryByText('tap')).not.toBeInTheDocument();
  });

  test('indexes the quota labels once per discovery', () => {
    vi.mocked(useUserInfo).mockReturnValue(makeUserInfoReturn(apiQuota));
    const getQuotaLabelIndex = vi.spyOn(
      ServiceDiscoveryQuery.prototype,
      'getQuotaLabelIndex'
    );

    const { rerender } = render(<QuotasPageClient />);
    rerender(<QuotasPageClient />);

    expect(getQuotaLabelIndex).toHaveBeenCalledTimes(1);
    getQuotaLabelIndex.mockRestore();
  });

  test('hides rate limits whose label discovery flags internal', () => {
    vi.mocked(useUserInfo).mockReturnValue(makeUserInfoReturn(apiQuota));
    mockDiscoveryState({
      discovery: {
        ...mockDiscovery,
        services: {
          ...mockDiscovery.services,
          internal: {
            ...mockDiscovery.services.internal,
            muster: {
              ...mockDiscovery.services.internal.muster,
              quota_labels: {
                'muster-quota': { title: 'Quota testing', internal: true },
              },
            },
          },
        },
      },
    });

    render(<QuotasPageClient />);

    expect(
      screen.getByText('Table access protocol (TAP) — TAP API calls')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Quota testing/)).not.toBeInTheDocument();
    expect(screen.queryByText('muster-quota')).not.toBeInTheDocument();
  });

  test('shows raw quota labels without quota labels in discovery', () => {
    // Discovery failed (empty fallback) or a Repertoire 2.x environment.
    vi.mocked(useUserInfo).mockReturnValue(makeUserInfoReturn(apiQuota));
    mockDiscoveryState({ discovery: getEmptyDiscovery() });

    render(<QuotasPageClient />);

    expect(screen.getByText('tap')).toBeInTheDocument();
    expect(screen.getByText('sia')).toBeInTheDocument();
    expect(screen.getByText('muster-quota')).toBeInTheDocument();
  });

  test('shows raw quota labels without a repertoireUrl', () => {
    // Without a repertoireUrl the discovery query is disabled and stays
    // pending, so there is no discovery to wait for.
    vi.mocked(useUserInfo).mockReturnValue(makeUserInfoReturn(apiQuota));
    mockDiscoveryState({ isPending: true });

    render(<QuotasPageClient />);

    expect(screen.getByText('tap')).toBeInTheDocument();
    expect(screen.getByText('muster-quota')).toBeInTheDocument();
  });

  test('holds the rate limits while discovery is pending', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(
      'https://data.example.org/repertoire/discovery'
    );
    vi.mocked(useUserInfo).mockReturnValue(makeUserInfoReturn(apiQuota));
    mockDiscoveryState({ isPending: true });

    render(<QuotasPageClient />);

    expect(screen.queryByText('Rate limits')).not.toBeInTheDocument();
    expect(screen.queryByText('tap')).not.toBeInTheDocument();
    expect(screen.queryByText('muster-quota')).not.toBeInTheDocument();
  });

  test('shows the labelled rate limits once discovery resolves', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(
      'https://data.example.org/repertoire/discovery'
    );
    vi.mocked(useUserInfo).mockReturnValue(makeUserInfoReturn(apiQuota));
    mockDiscoveryState({ isPending: true });

    const { rerender } = render(<QuotasPageClient />);
    mockDiscoveryState();
    rerender(<QuotasPageClient />);

    expect(
      screen.getByText('Table access protocol (TAP) — TAP API calls')
    ).toBeInTheDocument();
    expect(screen.queryByText('tap')).not.toBeInTheDocument();
  });
});
