import type { OIDCClient } from '@lsst-sqre/gafaelfawr-client';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import OIDCClientDetailPageClient from './OIDCClientDetailPageClient';

// Only the hooks that reach the network are mocked; the error classes and
// `toGafaelfawrErrorInfo` stay real so the page's status branching is
// exercised the same way it is in the app.
vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/gafaelfawr-client')>()),
  useOidcClient: vi.fn(),
  useUpdateOidcClient: vi.fn(),
  useDeleteOidcClient: vi.fn(),
}));

vi.mock('../../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => 'https://example.org/repertoire',
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Import after mocking.
import {
  GafaelfawrError,
  useDeleteOidcClient,
  useOidcClient,
  useUpdateOidcClient,
} from '@lsst-sqre/gafaelfawr-client';

const CLIENT_ID = 'a1b2c3d4-0000-4000-8000-000000000001';

const client: OIDCClient = {
  client_id: CLIENT_ID,
  return_uri: 'https://chronograf.example.org/oauth/callback',
  description: 'Chronograf dashboards',
  notes: 'Owned by the SQuaRE team.',
  url: 'https://chronograf.example.org/',
  last_modified_by: 'vera',
  created: '2026-01-14T09:30:00Z',
  last_modified: '2026-03-02T16:45:00Z',
};

const mockRefetch = vi.fn();

/**
 * Point the detail query at a given outcome.
 *
 * The result is derived from the id the hook is *called* with, the way the
 * real hook derives it from that id's cache entry. That is what makes the
 * delete tests below meaningful: a page that paused its query by blanking the
 * id would lose the client here, exactly as it does against real TanStack
 * Query, where a blanked id is a different query key.
 */
function mockQuery(overrides: Partial<ReturnType<typeof useOidcClient>> = {}) {
  vi.mocked(useOidcClient).mockImplementation((queriedClientId) => ({
    client: queriedClientId ? client : undefined,
    isLoading: false,
    isPending: false,
    error: null,
    isNotFound: false,
    refetch: mockRefetch,
    ...overrides,
  }));
}

/** Point the update mutation at a given outcome and return its spy. */
function mockUpdate(
  impl: () => Promise<OIDCClient> = async () => client,
  overrides: Partial<ReturnType<typeof useUpdateOidcClient>> = {}
) {
  const updateOidcClient = vi.fn(impl);
  vi.mocked(useUpdateOidcClient).mockReturnValue({
    updateOidcClient,
    isUpdating: false,
    error: null,
    reset: vi.fn(),
    ...overrides,
  });
  return updateOidcClient;
}

/** Point the delete mutation at a given outcome and return its spy. */
function mockDelete(
  impl: () => Promise<void> = async () => undefined,
  overrides: Partial<ReturnType<typeof useDeleteOidcClient>> = {}
) {
  const deleteOidcClient = vi.fn(impl);
  vi.mocked(useDeleteOidcClient).mockReturnValue({
    deleteOidcClient,
    isDeleting: false,
    error: null,
    reset: vi.fn(),
    ...overrides,
  });
  return deleteOidcClient;
}

/** The client id the detail query was last asked for. */
function lastQueriedClientId() {
  return vi.mocked(useOidcClient).mock.lastCall?.[0];
}

/** Whether the detail query was last asked to fetch. */
function lastQueryEnabled() {
  return vi.mocked(useOidcClient).mock.lastCall?.[2]?.enabled;
}

/** Open the delete confirmation modal and return it. */
async function openDeleteModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /delete client/i }));
  return screen.findByRole('dialog');
}

describe('OIDCClientDetailPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery();
    mockUpdate();
    mockDelete();
  });

  test('shows a loading state while the client loads', () => {
    mockQuery({ client: undefined, isLoading: true });
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/return uri/i)).not.toBeInTheDocument();
  });

  test('renders the client description and its metadata', () => {
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    expect(
      screen.getByRole('heading', { level: 1, name: /chronograf dashboards/i })
    ).toBeInTheDocument();
    expect(screen.getByText(CLIENT_ID)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'https://chronograf.example.org/' })
    ).toBeInTheDocument();
    // Timestamps render in the stable UTC form the listing uses.
    expect(screen.getByText('2026-01-14 09:30 UTC')).toBeInTheDocument();
    expect(screen.getByText('2026-03-02 16:45 UTC')).toBeInTheDocument();
    expect(screen.getByText('vera')).toBeInTheDocument();
  });

  test('offers a copy button for the client id', () => {
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    expect(
      screen.getByRole('button', { name: /copy client id/i })
    ).toBeInTheDocument();
  });

  test('never shows a client secret', () => {
    // Gafaelfawr discloses the secret only with the 201 and has no rotate
    // endpoint, so there is nothing to show here and pretending otherwise
    // would send an operator looking for a value that does not exist.
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    expect(screen.queryByText(/client secret/i)).not.toBeInTheDocument();
  });

  test('seeds the edit form with the client’s current values', () => {
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    expect(screen.getByLabelText(/return uri/i)).toHaveValue(
      'https://chronograf.example.org/oauth/callback'
    );
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Chronograf dashboards'
    );
    expect(screen.getByLabelText(/notes/i)).toHaveValue(
      'Owned by the SQuaRE team.'
    );
    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument();
  });

  test('renders a not-found note with a way back for an unknown id', () => {
    mockQuery({
      client: undefined,
      isNotFound: true,
      error: new GafaelfawrError('Client not found', 404),
    });
    render(<OIDCClientDetailPageClient clientId="nope" />);

    expect(screen.getByText(/client not found/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /back to oidc clients/i })
    ).toHaveAttribute('href', '/admin/oidc-clients');
    expect(screen.queryByLabelText(/return uri/i)).not.toBeInTheDocument();
  });

  test('names the missing scope when the load 403s', () => {
    mockQuery({
      client: undefined,
      error: new GafaelfawrError('Permission denied', 403),
    });
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    expect(screen.getByText('admin:oidc')).toBeInTheDocument();
    expect(screen.queryByLabelText(/return uri/i)).not.toBeInTheDocument();
  });

  test('offers a retry for a load failure that might succeed later', async () => {
    const user = userEvent.setup({ delay: 10 });
    mockQuery({ client: undefined, error: new TypeError('Failed to fetch') });
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /retry/i }));

    expect(mockRefetch).toHaveBeenCalled();
  });

  test('saves an edit and confirms it inline', async () => {
    const user = userEvent.setup({ delay: 10 });
    const updateOidcClient = mockUpdate();
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    const returnUri = screen.getByLabelText(/return uri/i);
    await user.clear(returnUri);
    await user.type(returnUri, 'https://chronograf.example.org/callback2');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      // Gafaelfawr's PATCH takes the whole updatable state, not a diff.
      expect(updateOidcClient).toHaveBeenCalledWith(CLIENT_ID, {
        return_uri: 'https://chronograf.example.org/callback2',
        description: 'Chronograf dashboards',
        notes: 'Owned by the SQuaRE team.',
      });
    });
    expect(await screen.findByText(/changes saved/i)).toBeInTheDocument();
  });

  test('clears notes explicitly when the operator empties the field', async () => {
    // Gafaelfawr's PATCH replaces the whole updatable state, so "no notes" has
    // to be sent as a value rather than left to whatever the server defaults an
    // absent key to — otherwise clearing the field silently does nothing.
    const user = userEvent.setup({ delay: 10 });
    const updateOidcClient = mockUpdate();
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    await user.clear(screen.getByLabelText(/notes/i));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateOidcClient).toHaveBeenCalledWith(
        CLIENT_ID,
        expect.objectContaining({ notes: null })
      );
    });
  });

  test('renders a 422 inline and keeps the operator’s input', async () => {
    const user = userEvent.setup({ delay: 10 });
    mockUpdate(async () => {
      throw new GafaelfawrError(
        'body.return_uri: URL scheme not permitted',
        422
      );
    });
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    const description = screen.getByLabelText(/description/i);
    await user.clear(description);
    await user.type(description, 'Chronograf (staging)');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(
      await screen.findByText(/url scheme not permitted/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Chronograf (staging)'
    );
    expect(screen.queryByText(/changes saved/i)).not.toBeInTheDocument();
  });

  test('deletes the client from the confirm modal and returns to the list', async () => {
    const user = userEvent.setup({ delay: 10 });
    const deleteOidcClient = mockDelete();
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    const dialog = await openDeleteModal(user);
    expect(
      within(dialog).getByText(/chronograf dashboards/i)
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole('button', { name: /delete client/i })
    );

    await waitFor(() => {
      expect(deleteOidcClient).toHaveBeenCalledWith(CLIENT_ID);
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/oidc-clients');
    });
  });

  test('pauses the client query while a deletion is in flight, without losing the client', async () => {
    // The mutation removes the client's cache entry on success. An observer
    // still subscribed at that moment refetches it straight into a 404 — a
    // self-inflicted error report for a delete that worked. Pausing the query
    // as soon as the request starts closes that window.
    const user = userEvent.setup({ delay: 10 });
    mockDelete(async () => undefined, { isDeleting: true });
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    const dialog = await openDeleteModal(user);

    // Paused through `enabled`, with the client id — and so the query key —
    // left alone. Blanking the id to pause it would move the query to a
    // different key and drop the cached client for the whole DELETE round
    // trip, replacing the detail view and this deliberately non-dismissable
    // confirmation with a spurious "failed to load" state.
    expect(lastQueriedClientId()).toBe(CLIENT_ID);
    expect(lastQueryEnabled()).toBe(false);
    expect(
      within(dialog).getByText(/chronograf dashboards/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/return uri/i)).toBeInTheDocument();
  });

  test('stops querying the client once it is deleted', async () => {
    const user = userEvent.setup({ delay: 10 });
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    const dialog = await openDeleteModal(user);
    await user.click(
      within(dialog).getByRole('button', { name: /delete client/i })
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/oidc-clients');
    });
    expect(lastQueryEnabled()).toBe(false);
    // Something honest stands in while the route transition completes, rather
    // than a "failed to load" state for a client that was deliberately removed.
    expect(
      screen.getByText(/returning to the client list/i)
    ).toBeInTheDocument();
  });

  test('leaves the client intact when the modal is cancelled', async () => {
    const user = userEvent.setup({ delay: 10 });
    const deleteOidcClient = mockDelete();
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    const dialog = await openDeleteModal(user);
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(deleteOidcClient).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/return uri/i)).toBeInTheDocument();
  });

  test('reports a failed delete in the modal without navigating away', async () => {
    const user = userEvent.setup({ delay: 10 });
    mockDelete(async () => {
      throw new GafaelfawrError('Permission denied', 403);
    });
    render(<OIDCClientDetailPageClient clientId={CLIENT_ID} />);

    const dialog = await openDeleteModal(user);
    await user.click(
      within(dialog).getByRole('button', { name: /delete client/i })
    );

    // The failure is reported where it was asked for, so the operator can
    // retry or back out without losing the confirmation context.
    expect(await within(dialog).findByText(/admin:oidc/)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(
      within(dialog).getByRole('button', { name: /cancel/i })
    ).toBeInTheDocument();
    // The client is still there, so the query resumes rather than staying
    // paused on a page the operator is going to keep using.
    expect(lastQueryEnabled()).toBe(true);
  });
});
