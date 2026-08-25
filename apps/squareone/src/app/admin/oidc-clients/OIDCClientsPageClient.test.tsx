import type {
  OIDCClient,
  UseOidcClientsReturn,
} from '@lsst-sqre/gafaelfawr-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Only the listing query is mocked; the error classes and helpers the page
// branches on stay real so the tests exercise the same classification the app
// does.
vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/gafaelfawr-client')>()),
  useOidcClients: vi.fn(),
}));

vi.mock('../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => 'https://example.org/.well-known/repertoire'),
}));

// Import after mocking.
import {
  GafaelfawrError,
  OidcNotConfiguredError,
  useOidcClients,
} from '@lsst-sqre/gafaelfawr-client';
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';
import OIDCClientsPageClient from './OIDCClientsPageClient';

const clients: OIDCClient[] = [
  {
    client_id: 'a1b2c3d4-0000-4000-8000-000000000001',
    return_uri: 'https://chronograf.example.org/oauth/callback',
    description: 'Chronograf dashboards',
    notes: null,
    url: null,
    last_modified_by: 'vera',
    created: '2026-01-14T09:30:00Z',
    last_modified: '2026-03-02T16:45:00Z',
  },
];

/** A `useOidcClients` return with everything at its resting value. */
function mockQuery(
  overrides: Partial<UseOidcClientsReturn> = {}
): UseOidcClientsReturn {
  return {
    clients: [],
    isLoading: false,
    isPending: false,
    error: null,
    isNotConfigured: false,
    refetch: vi.fn(),
    invalidate: vi.fn(),
    ...overrides,
  };
}

describe('OIDCClientsPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('lists the registered clients', () => {
    vi.mocked(useOidcClients).mockReturnValue(mockQuery({ clients }));

    render(<OIDCClientsPageClient />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Chronograf dashboards' })
    ).toHaveAttribute(
      'href',
      '/admin/oidc-clients/a1b2c3d4-0000-4000-8000-000000000001'
    );
  });

  test('resolves Gafaelfawr through Repertoire discovery', () => {
    vi.mocked(useOidcClients).mockReturnValue(mockQuery({ clients }));

    render(<OIDCClientsPageClient />);

    expect(useRepertoireUrl).toHaveBeenCalled();
    expect(useOidcClients).toHaveBeenCalledWith(
      'https://example.org/.well-known/repertoire'
    );
  });

  test('shows the empty state when no clients are registered', () => {
    vi.mocked(useOidcClients).mockReturnValue(mockQuery({ clients: [] }));

    render(<OIDCClientsPageClient />);

    expect(
      screen.getByText(/no openid connect clients are registered/i)
    ).toBeInTheDocument();
    // Registering the first client is the whole point of the empty page.
    expect(screen.getByRole('link', { name: /new client/i })).toBeVisible();
  });

  test('shows a loading state before the listing resolves', () => {
    vi.mocked(useOidcClients).mockReturnValue(
      mockQuery({ clients: undefined, isLoading: true, isPending: true })
    );

    render(<OIDCClientsPageClient />);

    expect(
      screen.getByText(/loading openid connect clients/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('explains a 404 as "no OpenID Connect server here" rather than an error', () => {
    vi.mocked(useOidcClients).mockReturnValue(
      mockQuery({
        clients: undefined,
        error: new OidcNotConfiguredError(),
        isNotConfigured: true,
      })
    );

    render(<OIDCClientsPageClient />);

    expect(
      screen.getByText(
        /openid connect server is not configured in this environment/i
      )
    ).toBeInTheDocument();
    // Nothing can be listed or created here, so neither affordance shows.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /new client/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /retry/i })
    ).not.toBeInTheDocument();
  });

  test('names the missing scope on a 403', () => {
    vi.mocked(useOidcClients).mockReturnValue(
      mockQuery({
        clients: undefined,
        error: new GafaelfawrError('Permission denied', 403),
      })
    );

    render(<OIDCClientsPageClient />);

    expect(screen.getByText('admin:oidc')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    // A 403 is not retryable: the answer will not change on a second try.
    expect(
      screen.queryByRole('button', { name: /retry/i })
    ).not.toBeInTheDocument();
  });

  test('offers a retry on any other failure', async () => {
    const refetch = vi.fn();
    vi.mocked(useOidcClients).mockReturnValue(
      mockQuery({
        clients: undefined,
        error: new GafaelfawrError('Gafaelfawr is unavailable', 500),
        refetch,
      })
    );

    render(<OIDCClientsPageClient />);

    expect(
      screen.getByText(/failed to load openid connect clients/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Gafaelfawr is unavailable')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  test('offers a retry when the request never reached Gafaelfawr', async () => {
    const refetch = vi.fn();
    vi.mocked(useOidcClients).mockReturnValue(
      mockQuery({
        clients: undefined,
        error: new TypeError('Failed to fetch'),
        refetch,
      })
    );

    render(<OIDCClientsPageClient />);

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
