import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the hooks so the component renders without a ConfigProvider/Suspense
// boundary or live service discovery.
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useUserInfo: vi.fn(),
}));

vi.mock('../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

vi.mock('../../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

import type { UseUserInfoReturn } from '@lsst-sqre/gafaelfawr-client';
// Import after mocking.
import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';

import { useStaticConfig } from '../../../hooks/useStaticConfig';
import type { AppConfig } from '../../../lib/config/loader';
import QuotasPageClient from './QuotasPageClient';

// Build a config object with only the fields the component reads, cast to the
// full AppConfig shape.
function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    docsBaseUrl: 'https://rsp.lsst.io',
    ...overrides,
  } as AppConfig;
}

// Helper to create a logged-in useUserInfo return value so AuthRequired renders
// its children.
function makeUserInfoReturn(): UseUserInfoReturn {
  return {
    userInfo: { username: 'testuser' },
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
    vi.mocked(useUserInfo).mockReturnValue(makeUserInfoReturn());
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
});
