import {
  type LoginInfo,
  useCreateServiceToken,
  useLoginInfo,
} from '@lsst-sqre/gafaelfawr-client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import NewServiceTokenPageClient from './NewServiceTokenPageClient';

vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@lsst-sqre/gafaelfawr-client')>();
  return {
    ...actual,
    useLoginInfo: vi.fn(),
    useCreateServiceToken: vi.fn(),
  };
});

vi.mock('../../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => undefined,
}));

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

// The admin's own scopes are a strict subset of the full configured list, so a
// scope only present in `config.scopes` proves the picker isn't filtered to the
// admin's own scopes.
const mockLoginInfo: LoginInfo = {
  csrf: 'csrf-token-123',
  username: 'admin',
  scopes: ['exec:admin', 'admin:token'],
  config: {
    scopes: [
      { name: 'read:tap', description: 'Read access to the TAP service' },
      { name: 'exec:notebook', description: 'Can execute notebooks' },
      { name: 'admin:token', description: 'Can manage all tokens' },
    ],
  },
};

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

function mockCreate(
  overrides: Partial<ReturnType<typeof useCreateServiceToken>> = {}
) {
  const createServiceToken = vi
    .fn()
    .mockResolvedValue({ token: 'gt-new-secret' });
  vi.mocked(useCreateServiceToken).mockReturnValue({
    createServiceToken,
    isCreating: false,
    error: null,
    reset: vi.fn(),
    ...overrides,
  });
  return createServiceToken;
}

describe('NewServiceTokenPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockLogin();
    mockCreate();
  });

  test('renders the create-a-service-token heading and form', () => {
    render(<NewServiceTokenPageClient />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Create a service token' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/bot username/i)).toBeInTheDocument();
  });

  test('does not render a manage-existing-tokens section', () => {
    render(<NewServiceTokenPageClient />);

    expect(
      screen.queryByRole('heading', { name: /manage existing tokens/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Bot user')).not.toBeInTheDocument();
  });

  test('offers the full configured scope list, not just the admin scopes', () => {
    render(<NewServiceTokenPageClient />);

    // read:tap is configured but NOT one of the admin's own scopes.
    expect(screen.getByLabelText(/read:tap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/exec:notebook/i)).toBeInTheDocument();
  });

  test('creates a service token and reveals the secret once', async () => {
    const user = userEvent.setup({ delay: 10 });
    const createServiceToken = mockCreate();
    render(<NewServiceTokenPageClient />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(createServiceToken).toHaveBeenCalledWith({
        username: 'bot-ci',
        scopes: ['read:tap'],
        expires: null,
      });
    });

    expect(await screen.findByText('gt-new-secret')).toBeInTheDocument();
  });

  test('forwards supplied advanced metadata to createServiceToken', async () => {
    const user = userEvent.setup({ delay: 10 });
    const createServiceToken = mockCreate();
    render(<NewServiceTokenPageClient />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.type(screen.getByLabelText('Name'), 'CI Bot');
    await user.type(screen.getByLabelText('UID'), '90000');
    await user.type(screen.getByLabelText('Groups'), 'g_developers:1001');
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(createServiceToken).toHaveBeenCalledWith({
        username: 'bot-ci',
        scopes: ['read:tap'],
        expires: null,
        name: 'CI Bot',
        uid: 90000,
        groups: [{ name: 'g_developers', id: 1001 }],
      });
    });
  });

  test('navigates back to the landing page when the success modal is closed', async () => {
    const user = userEvent.setup({ delay: 10 });
    mockCreate();
    render(<NewServiceTokenPageClient />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await user.click(await screen.findByRole('button', { name: /done/i }));

    expect(mockPush).toHaveBeenCalledWith('/admin/service-tokens');
  });

  test('navigates back to the landing page when Cancel is clicked', async () => {
    const user = userEvent.setup({ delay: 10 });
    render(<NewServiceTokenPageClient />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith('/admin/service-tokens');
  });

  test('surfaces a creation error via TokenCreationErrorDisplay', () => {
    mockCreate({
      error: { status: 422, message: 'Validation failed: bad scope' },
    });
    render(<NewServiceTokenPageClient />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/error creating token/i);
    expect(alert).toHaveTextContent(/validation failed: bad scope/i);
  });

  test('shows a loading state while login info loads', () => {
    mockLogin({ loginInfo: null, isLoading: true });
    render(<NewServiceTokenPageClient />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/bot username/i)).not.toBeInTheDocument();
  });

  test('shows an auth failure message when login info fails to load', () => {
    mockLogin({ loginInfo: null, error: new Error('boom') });
    render(<NewServiceTokenPageClient />);

    expect(
      screen.getByText(/failed to load authentication information/i)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/bot username/i)).not.toBeInTheDocument();
  });

  test('shows a banner and disables the form when admin:token is absent', () => {
    mockLogin({
      loginInfo: { ...mockLoginInfo, scopes: ['exec:admin'] },
    });
    render(<NewServiceTokenPageClient />);

    expect(
      screen.getByText(/required to create service tokens/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/bot username/i)).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /create service token/i })
    ).toBeDisabled();
  });

  test('enables the form and shows no banner when admin:token is present', () => {
    // The default mock login info includes `admin:token`.
    render(<NewServiceTokenPageClient />);

    expect(
      screen.queryByText(/required to create service tokens/i)
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/bot username/i)).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /create service token/i })
    ).toBeEnabled();
  });

  describe('query-parameter prefilling', () => {
    test('pre-fills username, scopes, and expiration from query params', () => {
      mockSearchParams = new URLSearchParams(
        'username=bot-foo&scopes=read:tap,exec:notebook&expiration=30d'
      );
      render(<NewServiceTokenPageClient />);

      expect(screen.getByLabelText(/bot username/i)).toHaveValue('bot-foo');
      expect(screen.getByLabelText(/read:tap/i)).toBeChecked();
      expect(screen.getByLabelText(/exec:notebook/i)).toBeChecked();
      expect(screen.getByRole('combobox')).toHaveTextContent(/30 days/i);
    });

    test('pre-fills the Advanced-settings metadata fields from query params', () => {
      mockSearchParams = new URLSearchParams(
        'name=CI+Bot&email=ci@example.com&uid=90000&gid=90001&groups=g_developers:1001,g_ops:1002'
      );
      render(<NewServiceTokenPageClient />);

      expect(screen.getByLabelText('Name')).toHaveValue('CI Bot');
      expect(screen.getByLabelText('Email')).toHaveValue('ci@example.com');
      expect(screen.getByLabelText('UID')).toHaveValue('90000');
      expect(screen.getByLabelText('GID')).toHaveValue('90001');
      // The comma-separated query list is normalised into the textarea's
      // one-group-per-line format.
      expect(screen.getByLabelText('Groups')).toHaveValue(
        'g_developers:1001\ng_ops:1002'
      );
    });

    test('leaves defaults when no query params are present', () => {
      render(<NewServiceTokenPageClient />);

      expect(screen.getByLabelText(/bot username/i)).toHaveValue('');
      expect(screen.getByRole('combobox')).toHaveTextContent(/never/i);
      expect(screen.getByLabelText('Name')).toHaveValue('');
      expect(screen.getByLabelText('Groups')).toHaveValue('');
    });

    test('ignores an invalid expiration param, keeping the never default', () => {
      mockSearchParams = new URLSearchParams('expiration=bogus');
      render(<NewServiceTokenPageClient />);

      expect(screen.getByRole('combobox')).toHaveTextContent(/never/i);
    });
  });
});
