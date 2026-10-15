/*
 * The token-creation page rendered from the state the root layout dehydrates
 * for a signed-in user: service discovery, the user's scopes, and user info,
 * but never login info. On a plain-ingress route the server-side scopes
 * prefetch caches login info in the layout's query client, so the state here
 * is built with `dehydrateLayoutState` from a client that holds it, exactly as
 * the layout serves it.
 *
 * Login info carries the CSRF token every mutation sends. Gafaelfawr mints the
 * token on a session's first `GET /auth/api/v1/login` and persists it only
 * through that response's `Set-Cookie`, so a token the server fetched never
 * reaches the browser's cookie. The hooks are real, so these tests pin that
 * hydrating the page makes the browser's own login request, that `csrfToken`
 * stays null until it resolves (no mutation can send a server-fetched token),
 * that the form's scope list renders once it does, and that React reports no
 * hydration mismatch.
 */

import {
  gafaelfawrKeys,
  mockLoginInfo,
  mockUserInfo,
} from '@lsst-sqre/gafaelfawr-client';
import {
  createDiscoveryQuery,
  discoveryQueryOptions,
  mockDiscovery,
} from '@lsst-sqre/repertoire-client';
import {
  type DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { waitFor, within } from '@testing-library/react';
import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, onTestFinished, test, vi } from 'vitest';

vi.mock('../../../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Import after mocking.
import { useLoginInfo } from '../../../../hooks/useLoginInfo';
import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../../../hooks/useStaticConfig';
import { dehydrateLayoutState } from '../../../../lib/auth/dehydrateLayoutState';
import NewTokenPageClient from './NewTokenPageClient';

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire';
const GAFAELFAWR_URL = createDiscoveryQuery(mockDiscovery).getGafaelfawrUrl();
const LOGIN_URL = `${GAFAELFAWR_URL}/login`;

/** The login info Gafaelfawr gives the server for the visitor's session. */
const serverLoginInfo = { ...mockLoginInfo, csrf: 'server-fetched-csrf' };

/** The login info the browser's own request gets, with the cookie's token. */
const browserLoginInfo = { ...mockLoginInfo, csrf: 'browser-cookie-csrf' };

/**
 * The state the root layout dehydrates for a signed-in user on a plain-ingress
 * route, where the scopes prefetch has also cached login info.
 */
function layoutState(): DehydratedState {
  const serverClient = new QueryClient();
  serverClient.setQueryData(
    discoveryQueryOptions(REPERTOIRE_URL).queryKey,
    mockDiscovery
  );
  serverClient.setQueryData(
    gafaelfawrKeys.userScopes(),
    serverLoginInfo.scopes
  );
  serverClient.setQueryData(gafaelfawrKeys.loginInfo(), serverLoginInfo);
  serverClient.setQueryData(gafaelfawrKeys.userInfo(), mockUserInfo);
  return dehydrateLayoutState(serverClient);
}

/** Renders the CSRF token mutations would send, as the page's hooks see it. */
function CsrfTokenProbe() {
  const { csrfToken } = useLoginInfo();
  return <output aria-label="CSRF token">{csrfToken ?? ''}</output>;
}

/** The page in a fresh query client hydrated with `state`. */
function hydratedPage(state: DehydratedState) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={state}>
        <NewTokenPageClient />
        <CsrfTokenProbe />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

/** A container holding `html`, removed when the test finishes. */
function mount(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  onTestFinished(() => container.remove());
  return container;
}

/**
 * Hydrate the server HTML for `state` with a separate browser query client,
 * returning the container and every hydration error React raised.
 */
async function hydrate(state: DehydratedState) {
  const container = mount(renderToString(hydratedPage(state)));
  const errors: unknown[] = [];
  // React logs attribute mismatches it can patch up to console.error rather
  // than raising a recoverable error, so watch both.
  const consoleError = vi.spyOn(console, 'error');
  let root: Root | undefined;
  await act(async () => {
    root = hydrateRoot(container, hydratedPage(state), {
      onRecoverableError: (error) => errors.push(error),
    });
  });
  onTestFinished(() => act(() => root?.unmount()));
  errors.push(
    ...consoleError.mock.calls.filter((args) =>
      args.some((arg) => /hydrat/i.test(String(arg)))
    )
  );
  return { container, errors, page: within(container) };
}

/**
 * Hold the browser's login request open until `respond` is called; answer the
 * token list with no tokens and leave anything else pending.
 */
function stubBrowserRequests() {
  let resolveLogin: (response: Response) => void = () => {};
  const login = new Promise<Response>((resolve) => {
    resolveLogin = resolve;
  });
  vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const url = String(input);
    if (url === LOGIN_URL) {
      return login;
    }
    if (url.startsWith(`${GAFAELFAWR_URL}/users/`)) {
      return Promise.resolve(Response.json([]));
    }
    return new Promise<Response>(() => {});
  });
  return {
    respond: () =>
      act(async () => resolveLogin(Response.json(browserLoginInfo))),
  };
}

describe('NewTokenPageClient hydrated from the root layout', () => {
  beforeEach(() => {
    vi.mocked(useStaticConfig).mockReturnValue({
      repertoireUrl: REPERTOIRE_URL,
    } as unknown as AppConfigContextValue);
  });

  test('ships no login info in the dehydrated state', () => {
    const keys = layoutState().queries.map((query) => query.queryKey);

    expect(keys).toContainEqual(gafaelfawrKeys.userScopes());
    expect(keys).toContainEqual(gafaelfawrKeys.userInfo());
    expect(keys).not.toContainEqual(gafaelfawrKeys.loginInfo());
  });

  test('fetches login info from the browser after hydrating', async () => {
    stubBrowserRequests();

    await hydrate(layoutState());

    // A browser request, with the cookie jar, not a forwarded cookie header.
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(LOGIN_URL, {
      credentials: 'include',
    });
  });

  test('keeps csrfToken null until the browser login request resolves', async () => {
    const browser = stubBrowserRequests();

    const { page } = await hydrate(layoutState());

    const csrfToken = page.getByRole('status', { name: 'CSRF token' });
    expect(csrfToken).toBeEmptyDOMElement();
    expect(page.getByText('Loading...')).toBeInTheDocument();

    await browser.respond();

    await waitFor(() =>
      expect(csrfToken).toHaveTextContent(browserLoginInfo.csrf)
    );
    // The form's scope list follows once the token list loads.
    expect(
      await page.findByRole('checkbox', { name: /read:tap/ })
    ).toBeInTheDocument();
  });

  test('never exposes the server-fetched CSRF token', async () => {
    const browser = stubBrowserRequests();

    const { container } = await hydrate(layoutState());
    await browser.respond();
    await waitFor(() =>
      expect(container).toHaveTextContent(browserLoginInfo.csrf)
    );

    expect(container.innerHTML).not.toContain(serverLoginInfo.csrf);
  });

  test('hydrates without a mismatch', async () => {
    stubBrowserRequests();

    const { errors } = await hydrate(layoutState());

    expect(errors).toEqual([]);
  });
});
