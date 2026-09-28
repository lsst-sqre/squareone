/*
 * The header's log-in control rendered from hydrated query state, the way the
 * root layout serves it: service discovery, login info, and user info are all
 * prefetched on the server and dehydrated into the page.
 *
 * The hooks are real, so these tests pin that the server HTML already shows a
 * signed-in user's menu (not "Log in"), that an anonymous visitor's "Log in"
 * link is there from the start, and that hydrating either in the browser
 * changes nothing: React reports no mismatch, and no user-info request is made.
 * `fetch` never settles, so nothing can arrive after hydration.
 */

import {
  getEmptyUserInfo,
  type LoginInfo,
  loginInfoQueryOptions,
  mockLoginInfo,
  mockUserInfo,
  type UserInfo,
  userInfoQueryOptions,
} from '@lsst-sqre/gafaelfawr-client';
import {
  discoveryQueryOptions,
  mockDiscovery,
} from '@lsst-sqre/repertoire-client';
import {
  type DehydratedState,
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { within } from '@testing-library/react';
import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, onTestFinished, test, vi } from 'vitest';

vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

vi.mock('../../hooks/useCurrentUrl', () => ({
  default: () => new URL('https://data.lsst.cloud/'),
}));

// Import after mocking.
import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../hooks/useStaticConfig';
import HeaderNav from './HeaderNav';

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire';

/** A visitor as the layout's prefetches see them. */
type Visitor = { userInfo: UserInfo; loginInfo: LoginInfo | null };

const signedIn: Visitor = { userInfo: mockUserInfo, loginInfo: mockLoginInfo };

/** Gafaelfawr answers an anonymous visitor's requests with a 401. */
const anonymous: Visitor = { userInfo: getEmptyUserInfo(), loginInfo: null };

/** The state the root layout dehydrates for `visitor`. */
function layoutState({ userInfo, loginInfo }: Visitor): DehydratedState {
  const serverClient = new QueryClient();
  serverClient.setQueryData(
    discoveryQueryOptions(REPERTOIRE_URL).queryKey,
    mockDiscovery
  );
  serverClient.setQueryData(loginInfoQueryOptions().queryKey, loginInfo);
  serverClient.setQueryData(userInfoQueryOptions().queryKey, userInfo);
  return dehydrate(serverClient);
}

/** The header nav in a fresh query client hydrated with `state`. */
function hydratedHeaderNav(state: DehydratedState) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={state}>
        <HeaderNav />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

/** The server render's HTML, as the browser receives it. */
function serverHtml(state: DehydratedState): string {
  return renderToString(hydratedHeaderNav(state));
}

/** The header's "User menu" navigation, which holds the log-in control. */
function userNav(container: HTMLElement) {
  return within(
    within(container).getByRole('navigation', { name: 'User menu' })
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
  const container = mount(serverHtml(state));
  const errors: unknown[] = [];
  // React logs attribute mismatches it can patch up to console.error rather
  // than raising a recoverable error, so watch both.
  const consoleError = vi.spyOn(console, 'error');
  let root: Root | undefined;
  await act(async () => {
    root = hydrateRoot(container, hydratedHeaderNav(state), {
      onRecoverableError: (error) => errors.push(error),
    });
  });
  onTestFinished(() => act(() => root?.unmount()));
  errors.push(
    ...consoleError.mock.calls.filter((args) =>
      args.some((arg) => /hydrat/i.test(String(arg)))
    )
  );
  return { container, errors };
}

describe('Login with hydrated user info', () => {
  beforeEach(() => {
    vi.mocked(useStaticConfig).mockReturnValue({
      repertoireUrl: REPERTOIRE_URL,
      enableAppsMenu: false,
      appLinks: [],
      baseUrl: 'https://data.lsst.cloud',
      enableUserNotifications: false,
      userNotificationsPollIntervalSeconds: 300,
    } as unknown as AppConfigContextValue);
    // Any request the hydrated state does not answer stays pending forever.
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise<Response>(() => {})
    );
  });

  test("server-renders a signed-in user's menu, not a Log in link", () => {
    const nav = userNav(mount(serverHtml(layoutState(signedIn))));

    expect(
      nav.getByRole('button', { name: mockUserInfo.username })
    ).toBeInTheDocument();
    expect(nav.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
  });

  test('server-renders Log in, and no menu, for an anonymous visitor', () => {
    const nav = userNav(mount(serverHtml(layoutState(anonymous))));

    expect(nav.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
    expect(nav.queryByRole('button')).not.toBeInTheDocument();
  });

  test('requests no user info after hydrating', async () => {
    await hydrate(layoutState(signedIn));

    // The hydrated entry is fresh, and nothing else asks for the user: the
    // menu reads the same query rather than making its own request.
    const urls = vi.mocked(fetch).mock.calls.map(([input]) => String(input));
    expect(urls.filter((url) => url.includes('user-info'))).toEqual([]);
  });

  test("hydrates a signed-in user's header without a mismatch", async () => {
    const { container, errors } = await hydrate(layoutState(signedIn));

    expect(errors).toEqual([]);
    expect(
      userNav(container).getByRole('button', { name: mockUserInfo.username })
    ).toBeInTheDocument();
  });

  test("hydrates an anonymous visitor's header without a mismatch", async () => {
    const { container, errors } = await hydrate(layoutState(anonymous));

    expect(errors).toEqual([]);
    const nav = userNav(container);
    expect(nav.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
    expect(nav.queryByRole('button')).not.toBeInTheDocument();
  });
});
