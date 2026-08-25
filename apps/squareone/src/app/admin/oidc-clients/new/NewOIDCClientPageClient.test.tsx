import type {
  LoginInfo,
  OIDCClientWithSecret,
} from '@lsst-sqre/gafaelfawr-client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  type AppConfigContextValue,
  useStaticConfig,
} from '../../../../hooks/useStaticConfig';
import type { AdminPageScopes } from '../../../../lib/config/adminPageScopes';
import NewOIDCClientPageClient from './NewOIDCClientPageClient';

// Only the hooks that reach the network are mocked; the error classes and
// `toGafaelfawrErrorInfo` stay real so the page's status branching is
// exercised the same way it is in the app.
vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/gafaelfawr-client')>()),
  useLoginInfo: vi.fn(),
  useCreateOidcClient: vi.fn(),
}));

vi.mock('../../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => 'https://example.org/repertoire',
}));

// The scope the form gate checks comes from `adminPageScopes` in the config.
vi.mock('../../../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Import after mocking.
import {
  GafaelfawrError,
  OidcNotConfiguredError,
  useCreateOidcClient,
  useLoginInfo,
} from '@lsst-sqre/gafaelfawr-client';

const createdClient: OIDCClientWithSecret = {
  client_id: 'a1b2c3d4-0000-4000-8000-000000000009',
  client_secret: 'dev-oidc-secret-0001-xxxxxxxxxxxxxxxxxxxxxxxx',
  return_uri: 'https://app.example.org/oauth/callback',
  description: 'Example relying party',
  notes: null,
  url: null,
  last_modified_by: 'vera',
  created: '2026-08-25T12:00:00Z',
  last_modified: '2026-08-25T12:00:00Z',
};

const mockLoginInfo: LoginInfo = {
  csrf: 'csrf-token-123',
  username: 'vera',
  scopes: ['exec:admin', 'admin:oidc'],
  config: { scopes: [] },
};

/**
 * Set the resolved static config. Omitting `adminPageScopes` exercises the
 * baked-in defaults (`oidcClients: ['admin:oidc']`).
 */
function mockConfig(adminPageScopes?: AdminPageScopes) {
  vi.mocked(useStaticConfig).mockReturnValue({
    siteName: 'Rubin Science Platform',
    ...(adminPageScopes ? { adminPageScopes } : {}),
  } as AppConfigContextValue);
}

function mockLogin(overrides: Partial<ReturnType<typeof useLoginInfo>> = {}) {
  vi.mocked(useLoginInfo).mockReturnValue({
    loginInfo: mockLoginInfo,
    query: null,
    csrfToken: mockLoginInfo.csrf,
    isLoading: false,
    isPending: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  });
}

/** Point the create hook at a given outcome and return its spy. */
function mockCreate(
  impl: () => Promise<OIDCClientWithSecret> = async () => createdClient
) {
  const createOidcClient = vi.fn(impl);
  vi.mocked(useCreateOidcClient).mockReturnValue({
    createOidcClient,
    isCreating: false,
    error: null,
    reset: vi.fn(),
  });
  return createOidcClient;
}

/** Fill the form's required fields and submit. */
async function submitForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByLabelText(/return uri/i),
    'https://app.example.org/oauth/callback'
  );
  await user.type(
    screen.getByLabelText(/description/i),
    'Example relying party'
  );
  await user.click(screen.getByRole('button', { name: /create client/i }));
}

describe('NewOIDCClientPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig();
    mockLogin();
    mockCreate();
  });

  test('renders the create heading and form', () => {
    render(<NewOIDCClientPageClient />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /register an openid connect client/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/return uri/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  test('shows a loading state while login info loads', () => {
    mockLogin({ loginInfo: null, isLoading: true });
    render(<NewOIDCClientPageClient />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/return uri/i)).not.toBeInTheDocument();
  });

  test('shows an auth failure message when login info fails to load', () => {
    mockLogin({ loginInfo: null, error: new Error('boom') });
    render(<NewOIDCClientPageClient />);

    expect(
      screen.getByText(/failed to load authentication information/i)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/return uri/i)).not.toBeInTheDocument();
  });

  test('disables the form and explains why without the configured scope', () => {
    mockLogin({ loginInfo: { ...mockLoginInfo, scopes: ['exec:admin'] } });
    render(<NewOIDCClientPageClient />);

    expect(
      screen.getByText(/required to register openid connect clients/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/return uri/i)).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /create client/i })
    ).toBeDisabled();
  });

  test('follows a deployment override of the oidcClients scopes', () => {
    // Which scope guards Gafaelfawr's OIDC API is Helm-configurable, so the
    // gate has to read it from config rather than hard-coding `admin:oidc`.
    mockConfig({ oidcClients: ['admin:oidc-custom'] });
    mockLogin({
      loginInfo: { ...mockLoginInfo, scopes: ['admin:oidc-custom'] },
    });
    render(<NewOIDCClientPageClient />);

    expect(
      screen.queryByText(/required to register openid connect clients/i)
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/return uri/i)).toBeEnabled();
  });

  test('registers the client and replaces the form with the secret', async () => {
    const user = userEvent.setup({ delay: 10 });
    const createOidcClient = mockCreate();
    render(<NewOIDCClientPageClient />);

    await submitForm(user);

    await waitFor(() => {
      expect(createOidcClient).toHaveBeenCalledWith({
        return_uri: 'https://app.example.org/oauth/callback',
        description: 'Example relying party',
      });
    });

    // The secret is disclosed exactly once, here.
    expect(
      await screen.findByText(createdClient.client_secret)
    ).toBeInTheDocument();
    expect(screen.getByText(createdClient.client_id)).toBeInTheDocument();
    // The form is gone, so the secret cannot be lost to an accidental resubmit.
    expect(screen.queryByLabelText(/return uri/i)).not.toBeInTheDocument();
    // Creating does not navigate: leaving is the operator's deliberate act.
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('sends notes when the operator supplies them', async () => {
    const user = userEvent.setup({ delay: 10 });
    const createOidcClient = mockCreate();
    render(<NewOIDCClientPageClient />);

    await user.type(screen.getByLabelText(/notes/i), 'Owned by SQuaRE');
    await submitForm(user);

    await waitFor(() => {
      expect(createOidcClient).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Owned by SQuaRE' })
      );
    });
  });

  test('renders a 422 inline with the server message and keeps the input', async () => {
    const user = userEvent.setup({ delay: 10 });
    mockCreate(async () => {
      throw new GafaelfawrError(
        'body.return_uri: URL scheme not permitted',
        422
      );
    });
    render(<NewOIDCClientPageClient />);

    await submitForm(user);

    expect(
      await screen.findByText(/url scheme not permitted/i)
    ).toBeInTheDocument();
    // The form is still there with the values that need correcting.
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Example relying party'
    );
    expect(
      screen.queryByText(createdClient.client_secret)
    ).not.toBeInTheDocument();
  });

  test('names the missing scope on a 403', async () => {
    const user = userEvent.setup({ delay: 10 });
    // Gafaelfawr's own 403 body says only "Permission denied", which tells the
    // operator nothing they can act on.
    mockCreate(async () => {
      throw new GafaelfawrError('Permission denied', 403);
    });
    render(<NewOIDCClientPageClient />);

    await submitForm(user);

    expect(await screen.findByText(/admin:oidc/)).toBeInTheDocument();
    expect(screen.getByLabelText(/return uri/i)).toBeInTheDocument();
  });

  test('explains a 404 as "no OpenID Connect server here"', async () => {
    const user = userEvent.setup({ delay: 10 });
    mockCreate(async () => {
      throw new OidcNotConfiguredError();
    });
    render(<NewOIDCClientPageClient />);

    await submitForm(user);

    expect(
      await screen.findByText(/openid connect server is not configured/i)
    ).toBeInTheDocument();
  });

  test('shows a network failure inline', async () => {
    const user = userEvent.setup({ delay: 10 });
    mockCreate(async () => {
      throw new TypeError('Failed to fetch');
    });
    render(<NewOIDCClientPageClient />);

    await submitForm(user);

    expect(await screen.findByText(/failed to fetch/i)).toBeInTheDocument();
  });

  test('navigates back to the listing when Cancel is clicked', async () => {
    const user = userEvent.setup({ delay: 10 });
    render(<NewOIDCClientPageClient />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith('/admin/oidc-clients');
  });
});
