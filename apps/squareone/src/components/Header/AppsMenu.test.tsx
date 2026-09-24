import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Keep the real discovery query helpers and mock data; only the hook that
// fetches discovery is replaced.
vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  useServiceDiscovery: vi.fn(),
}));

// useLoginInfo supplies the signed-in user's scopes.
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useLoginInfo: vi.fn(),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(),
}));

vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

// Import after mocking.
import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { mockDiscovery } from '@lsst-sqre/repertoire-client';
import { PrimaryNavigation } from '@lsst-sqre/squared';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../hooks/useStaticConfig';
import {
  mockAnonymous,
  mockDiscoveryState,
  mockSignedIn,
} from '../../tests/serviceAccessMocks';
import AppsMenu from './AppsMenu';

const REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire/discovery';

function mockAppLinks(appLinks: AppConfigContextValue['appLinks']) {
  vi.mocked(useStaticConfig).mockReturnValue({
    enableAppsMenu: true,
    appLinks,
  } as AppConfigContextValue);
}

/** Render the menu in the navigation root it lives in, then open it. */
async function openAppsMenu() {
  const user = userEvent.setup();
  render(
    <PrimaryNavigation>
      <AppsMenu />
    </PrimaryNavigation>
  );
  await user.click(screen.getByRole('button', { name: 'Apps' }));
}

/** The labels of the opened menu's links (its only links), in order. */
function menuLabels() {
  return screen.getAllByRole('link').map((link) => link.textContent);
}

describe('AppsMenu', () => {
  beforeEach(() => {
    vi.mocked(useRepertoireUrl).mockReturnValue(REPERTOIRE_URL);
    mockAppLinks([]);
    mockDiscoveryState();
    mockAnonymous();
  });

  test('lists Times Square and the admin tools for an exec:admin user', async () => {
    mockSignedIn(['exec:admin']);

    await openAppsMenu();

    expect(menuLabels()).toEqual([
      'Times Square',
      'Argo CD',
      'Chronograf metrics viewer',
    ]);
    expect(screen.getByRole('link', { name: 'Argo CD' })).toHaveAttribute(
      'href',
      'https://data.lsst.cloud/argo-cd'
    );
  });

  test('lists only Times Square for a user with just exec:notebook', async () => {
    mockSignedIn(['exec:notebook']);

    await openAppsMenu();

    expect(menuLabels()).toEqual(['Times Square']);
    expect(screen.getByRole('link', { name: 'Times Square' })).toHaveAttribute(
      'href',
      '/times-square/'
    );
  });

  test('adds Kafdrop for a user holding exec:internal-tools', async () => {
    mockSignedIn(['exec:admin', 'exec:internal-tools']);

    await openAppsMenu();

    expect(menuLabels()).toEqual([
      'Times Square',
      'Argo CD',
      'Chronograf metrics viewer',
      'Kafdrop Kafka viewer',
    ]);
  });

  test('appends configured appLinks without repeating an href', async () => {
    mockSignedIn(['exec:admin']);
    mockAppLinks([
      { label: 'Times Square', href: '/times-square/', internal: true },
      { label: 'Argo CD', href: '/argo-cd/', internal: false },
      { label: 'Nightly Digest', href: '/nightlydigest/', internal: false },
    ]);

    await openAppsMenu();

    expect(menuLabels()).toEqual([
      'Times Square',
      'Argo CD',
      'Chronograf metrics viewer',
      'Nightly Digest',
    ]);
  });

  test('lists only the configured appLinks without service discovery', async () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    mockDiscoveryState({ isPending: true });
    mockSignedIn(['exec:admin']);
    mockAppLinks([
      { label: 'Nightly Digest', href: '/nightlydigest/', internal: false },
    ]);

    await openAppsMenu();

    expect(menuLabels()).toEqual(['Nightly Digest']);
  });

  test('renders no navigation item when there are no items', () => {
    // Anonymous, no appLinks, and no Times Square application.
    mockDiscoveryState({ discovery: { ...mockDiscovery, applications: [] } });

    render(
      <PrimaryNavigation>
        <AppsMenu />
      </PrimaryNavigation>
    );

    expect(
      screen.queryByRole('button', { name: 'Apps' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('reports login-info failures to Sentry like the user menu', () => {
    render(
      <PrimaryNavigation>
        <AppsMenu />
      </PrimaryNavigation>
    );

    expect(useLoginInfo).toHaveBeenCalledWith(REPERTOIRE_URL, {
      reportError: expect.any(Function),
      context: { site: 'login-info', package: 'gafaelfawr-client' },
    });
  });
});
