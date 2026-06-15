/*
 * Shell render-determinism tests.
 *
 * These guard PRD #455 / DM-55227: the shared App Router shell must render
 * identically given the same props so a future SSR/CSR non-determinism
 * regression (a stray Date.now(), Math.random(), locale-dependent format, or
 * environment-conditional branch) is caught here rather than surfacing as an
 * app-wide React hydration mismatch in production.
 *
 * Each shell component is rendered to static server markup twice with the same
 * props and the two outputs are asserted byte-identical. React's useId values
 * are tree-position-based under server rendering, so they are stable across the
 * two renders; only genuine non-determinism would make the strings diverge.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// next/image -> deterministic <img> passthrough, so the shell renders without
// the Next image loader / static-asset pipeline in the unit environment.
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: {
    src: string | { src: string };
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
  }) => {
    const { src, alt, width, height, className } = props;
    const resolvedSrc = typeof src === 'string' ? src : (src?.src ?? '');
    return (
      <img
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  },
}));

// Config + data hooks are mocked so the shell renders deterministic, fixed
// content independent of any live config or network state.
vi.mock('../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  useServiceDiscovery: vi.fn(),
}));

vi.mock('@lsst-sqre/semaphore-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/semaphore-client')>()),
  useBroadcasts: vi.fn(),
}));

vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/gafaelfawr-client')>()),
  useUserInfo: vi.fn(),
  useLoginInfo: vi.fn(),
}));

vi.mock('@lsst-sqre/squared', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/squared')>()),
  useGafaelfawrUser: vi.fn(),
}));

// Imports after mocks.
import type {
  UseLoginInfoReturn,
  UseUserInfoReturn,
} from '@lsst-sqre/gafaelfawr-client';
import { useLoginInfo, useUserInfo } from '@lsst-sqre/gafaelfawr-client';
import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import type { Broadcast } from '@lsst-sqre/semaphore-client';
import { useBroadcasts } from '@lsst-sqre/semaphore-client';
import { PrimaryNavigation, useGafaelfawrUser } from '@lsst-sqre/squared';

import BroadcastBannerStack from '../components/BroadcastBannerStack';
import Header from '../components/Header';
import UserMenu from '../components/Header/UserMenu';
import { useStaticConfig } from '../hooks/useStaticConfig';
import type { AppConfig } from '../lib/config/loader';
import FooterRsc from './FooterRsc';

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    siteName: 'Rubin Science Platform',
    baseUrl: 'https://data.example.org',
    environmentName: 'production',
    repertoireUrl: 'https://data.example.org/api/discovery',
    enableAppsMenu: true,
    appLinks: [
      { label: 'Portal', href: '/portal/app', internal: true },
      { label: 'Docs', href: 'https://docs.example.org', internal: false },
    ],
    headerLogoUrl: 'https://data.example.org/logo.png',
    headerLogoWidth: 100,
    headerLogoHeight: 50,
    headerLogoAlt: 'Rubin',
    ...overrides,
  } as AppConfig;
}

// A fake discovery query exposing only the methods the shell calls.
function makeDiscoveryReturn() {
  const query = {
    hasPortal: () => true,
    hasNublado: () => true,
    getPortalUrl: () => 'https://data.example.org/portal/app',
    getNubladoUrl: () => 'https://data.example.org/nb/hub',
    getSemaphoreUrl: () => 'https://data.example.org/semaphore',
  };
  return {
    discovery: {},
    query,
    refetch: vi.fn(),
    isStale: false,
    isPending: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useServiceDiscovery>;
}

function loggedOutUserInfo(): UseUserInfoReturn {
  return {
    userInfo: undefined,
    query: null,
    isLoggedIn: false,
    isLoading: false,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  };
}

function emptyBroadcasts(): ReturnType<typeof useBroadcasts> {
  return {
    broadcasts: [],
    refetch: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useBroadcasts>;
}

describe('shell render determinism', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useStaticConfig).mockReturnValue(makeConfig());
    vi.mocked(useServiceDiscovery).mockReturnValue(makeDiscoveryReturn());
    vi.mocked(useUserInfo).mockReturnValue(loggedOutUserInfo());
    vi.mocked(useBroadcasts).mockReturnValue(emptyBroadcasts());
  });

  test('Header renders identical markup across renders', () => {
    const first = renderToStaticMarkup(<Header />);
    const second = renderToStaticMarkup(<Header />);

    expect(first).toBe(second);
    // Sanity-check the shell actually rendered its logged-out chain (Login
    // renders the "Log in" CTA on the server, before hasMounted swaps in the
    // user menu) rather than an empty string that would compare trivially.
    expect(first).toContain('Log in');
    expect(first).toContain('Notebooks');
  });

  test('FooterRsc default content renders identical markup across renders', () => {
    const first = renderToStaticMarkup(<FooterRsc />);
    const second = renderToStaticMarkup(<FooterRsc />);

    expect(first).toBe(second);
    expect(first).toContain('Acceptable use policy');
  });

  test('FooterRsc with MDX content renders identical markup across renders', () => {
    const mdx = <div>Custom footer content</div>;
    const first = renderToStaticMarkup(<FooterRsc mdxContent={mdx} />);
    const second = renderToStaticMarkup(<FooterRsc mdxContent={mdx} />);

    expect(first).toBe(second);
    expect(first).toContain('Custom footer content');
  });

  test('BroadcastBannerStack renders identical markup across renders', () => {
    const broadcast: Broadcast = {
      id: 'broadcast-1',
      summary: {
        gfm: 'Scheduled maintenance window',
        html: '<p>Scheduled maintenance window</p>',
      },
      active: true,
      enabled: true,
      stale: false,
      category: 'info',
    };
    vi.mocked(useBroadcasts).mockReturnValue({
      broadcasts: [broadcast],
      refetch: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useBroadcasts>);

    const first = renderToStaticMarkup(<BroadcastBannerStack />);
    const second = renderToStaticMarkup(<BroadcastBannerStack />);

    expect(first).toBe(second);
    expect(first).toContain('Scheduled maintenance window');
  });

  test('UserMenu renders identical markup across renders', () => {
    vi.mocked(useGafaelfawrUser).mockReturnValue({
      user: { username: 'testuser' },
      isLoading: false,
      isValidating: false,
      isLoggedIn: true,
      error: undefined,
    } as ReturnType<typeof useGafaelfawrUser>);
    vi.mocked(useLoginInfo).mockReturnValue({
      loginInfo: null,
      query: {
        hasScope: (scope: string): boolean => scope === 'exec:admin',
      } as UseLoginInfoReturn['query'],
      csrfToken: null,
      isLoading: false,
      isPending: false,
      error: null,
      refetch: vi.fn(),
    });

    const ui = (
      <PrimaryNavigation>
        <PrimaryNavigation.Item>
          <UserMenu pageUrl={new URL('https://data.example.org/')} />
        </PrimaryNavigation.Item>
      </PrimaryNavigation>
    );
    const first = renderToStaticMarkup(ui);
    const second = renderToStaticMarkup(ui);

    expect(first).toBe(second);
    expect(first).toContain('testuser');
  });
});
