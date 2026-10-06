/*
 * HeaderNav (and its Apps menu) rendered from hydrated query state, the way
 * the root layout serves it: service discovery and the signed-in user's scopes
 * are both prefetched on the server and dehydrated into the page.
 *
 * Unlike HeaderNav.test.tsx, the discovery and user-scopes hooks are real here,
 * so these tests pin that the scope-gated entries are already right on the
 * first render: a signed-in user's hidden entries never flash in, and their
 * Apps menu never pops in, once the browser's own login request would have
 * resolved. The state carries no login-info entry at all, as the layout
 * dehydrates on a GafaelfawrIngress route (where the scopes come from the
 * delegated token and login info is left to the browser), so the nav must
 * gate on the scopes entry alone. `fetch` never settles, so nothing can arrive
 * after hydration.
 */

import { userScopesQueryOptions } from '@lsst-sqre/gafaelfawr-client';
import {
  discoveryQueryOptions,
  mockDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import {
  type DehydratedState,
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, onTestFinished, test, vi } from 'vitest';

vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

vi.mock('../../hooks/useCurrentUrl', () => ({
  default: () => new URL('https://data.lsst.cloud/'),
}));

// The login control has its own data dependencies (user info) and tests.
vi.mock('./Login', () => ({ default: (): null => null }));

// Import after mocking.
import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../hooks/useStaticConfig';
import HeaderNav from './HeaderNav';

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire';

/** mockDiscovery without the Times Square application. */
const discoveryWithoutTimesSquare: ServiceDiscovery = {
  ...mockDiscovery,
  applications: mockDiscovery.applications.filter(
    (name) => name !== 'times-square'
  ),
};

/** A signed-in user holding exactly `scopes`. */
function signedIn(scopes: string[]): string[] {
  return scopes;
}

/**
 * The state the root layout dehydrates: discovery plus the visitor's scopes
 * (`null` for an anonymous visitor, whose auth requests get a 401).
 */
function layoutState(
  userScopes: string[] | null,
  discovery: ServiceDiscovery = mockDiscovery
): DehydratedState {
  const serverClient = new QueryClient();
  serverClient.setQueryData(
    discoveryQueryOptions(REPERTOIRE_URL).queryKey,
    discovery
  );
  serverClient.setQueryData(userScopesQueryOptions().queryKey, userScopes);
  return dehydrate(serverClient);
}

/** HeaderNav in a fresh browser query client hydrated with `state`. */
function hydratedHeaderNav(state: DehydratedState) {
  const browserClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={browserClient}>
      <HydrationBoundary state={state}>
        <HeaderNav />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

/**
 * The first render's markup, mounted for querying. A single server render pass
 * is exactly what the browser's first render must reproduce to hydrate.
 */
function firstRender(state: DehydratedState) {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(hydratedHeaderNav(state));
  document.body.appendChild(container);
  onTestFinished(() => container.remove());
  return within(container);
}

describe('HeaderNav with hydrated user scopes', () => {
  beforeEach(() => {
    vi.mocked(useStaticConfig).mockReturnValue({
      repertoireUrl: REPERTOIRE_URL,
      enableAppsMenu: true,
      appLinks: [],
      baseUrl: 'https://data.lsst.cloud',
    } as unknown as AppConfigContextValue);
    // Any request the hydrated state does not answer stays pending forever.
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise<Response>(() => {})
    );
  });

  test('never renders Portal for a signed-in user without exec:portal', () => {
    const nav = firstRender(layoutState(signedIn(['exec:notebook'])));

    expect(nav.queryByRole('link', { name: 'Portal' })).not.toBeInTheDocument();
    expect(nav.getByRole('link', { name: 'Notebooks' })).toHaveAttribute(
      'href',
      'https://data.lsst.cloud/nb'
    );
  });

  test('renders Portal and Notebooks for an anonymous visitor', () => {
    const nav = firstRender(layoutState(null));

    expect(nav.getByRole('link', { name: 'Portal' })).toBeInTheDocument();
    expect(nav.getByRole('link', { name: 'Notebooks' })).toBeInTheDocument();
  });

  test('renders the Apps menu on the first render for an exec:admin user', () => {
    // Without Times Square or configured appLinks, only the scope-gated
    // discovery items give the menu anything to list.
    const nav = firstRender(
      layoutState(signedIn(['exec:admin']), discoveryWithoutTimesSquare)
    );

    expect(nav.getByRole('button', { name: 'Apps' })).toBeInTheDocument();
  });

  test("lists the exec:admin user's discovery items without fetching", async () => {
    const user = userEvent.setup();
    render(
      hydratedHeaderNav(
        layoutState(signedIn(['exec:admin']), discoveryWithoutTimesSquare)
      )
    );

    await user.click(screen.getByRole('button', { name: 'Apps' }));

    expect(screen.getByRole('link', { name: 'Argo CD' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Chronograf metrics viewer' })
    ).toBeInTheDocument();
    // The hydrated scopes are fresh, so the browser issues no login request,
    // even though no login info was hydrated.
    expect(fetch).not.toHaveBeenCalled();
  });
});
