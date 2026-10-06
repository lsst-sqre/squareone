import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/gafaelfawr-client')>()),
  useUserScopes: vi.fn(),
}));

vi.mock('./useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(),
}));

vi.mock('../lib/sentry/reportError', () => ({
  makeReportError: vi.fn(),
}));

// Import after mocking.
import {
  type UseUserScopesReturn,
  // biome-ignore lint/style/noRestrictedImports: this test asserts what the app hook passes to the package hook.
  useUserScopes as usePackageUserScopes,
} from '@lsst-sqre/gafaelfawr-client';
import { makeReportError } from '../lib/sentry/reportError';
import { useRepertoireUrl } from './useRepertoireUrl';
import { useUserScopes } from './useUserScopes';

const REPERTOIRE_URL = 'https://data.example.org/repertoire';

/** The package hook's result for an anonymous visitor. */
const packageResult: UseUserScopesReturn = {
  scopes: undefined,
  hasScope: () => false,
  isLoading: false,
  isPending: false,
  error: null,
  refetch: vi.fn(),
};

/** The reporter `makeReportError` builds, as a recognizable stand-in. */
const sentryReporter = vi.fn();

/** The config the app hook passed to the package hook on its latest call. */
function packageConfig() {
  return vi.mocked(usePackageUserScopes).mock.lastCall?.[1];
}

describe('useUserScopes (app)', () => {
  beforeEach(() => {
    // `restoreMocks` leaves module-mock call records in place; start clean.
    vi.clearAllMocks();
    vi.mocked(useRepertoireUrl).mockReturnValue(REPERTOIRE_URL);
    vi.mocked(usePackageUserScopes).mockReturnValue(packageResult);
    vi.mocked(makeReportError).mockReturnValue(sentryReporter);
  });

  it('resolves Gafaelfawr through the configured Repertoire URL', () => {
    renderHook(() => useUserScopes());

    expect(usePackageUserScopes).toHaveBeenCalledWith(
      REPERTOIRE_URL,
      expect.anything()
    );
  });

  it("attaches the app's client-side Sentry reporter", () => {
    renderHook(() => useUserScopes());

    expect(makeReportError).toHaveBeenCalledWith({ isServer: false });
    expect(packageConfig()?.reportError).toBe(sentryReporter);
  });

  it('tags reports with the user-scopes context', () => {
    renderHook(() => useUserScopes());

    expect(packageConfig()?.context).toEqual({
      site: 'user-scopes',
      package: 'gafaelfawr-client',
    });
  });

  it("passes the caller's extra query options through", () => {
    const logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };

    renderHook(() => useUserScopes({ logger }));

    expect(packageConfig()?.logger).toBe(logger);
  });

  it('keeps the reporter stable across renders', () => {
    const { rerender } = renderHook(() => useUserScopes());
    rerender();

    expect(makeReportError).toHaveBeenCalledTimes(1);
  });

  it("returns the package hook's result", () => {
    const { result } = renderHook(() => useUserScopes());

    expect(result.current).toBe(packageResult);
  });
});
