import {
  type LoginInfo,
  useCreateServiceToken,
  useLoginInfo,
} from '@lsst-sqre/gafaelfawr-client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import ServiceTokenPageClient from './ServiceTokenPageClient';

vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@lsst-sqre/gafaelfawr-client')>();
  return {
    ...actual,
    useLoginInfo: vi.fn(),
    useCreateServiceToken: vi.fn(),
  };
});

vi.mock('../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => undefined,
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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

describe('ServiceTokenPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin();
    mockCreate();
  });

  test('renders the page heading and both sections', () => {
    render(<ServiceTokenPageClient />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Service tokens' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /create a service token/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /manage existing tokens/i,
      })
    ).toBeInTheDocument();
  });

  test('renders the manage-existing-tokens lookup form', () => {
    render(<ServiceTokenPageClient />);

    expect(screen.getByLabelText('Bot user')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /look up tokens/i })
    ).toBeInTheDocument();
  });

  test('offers the full configured scope list, not just the admin scopes', () => {
    render(<ServiceTokenPageClient />);

    // read:tap is configured but NOT one of the admin's own scopes.
    expect(screen.getByLabelText(/read:tap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/exec:notebook/i)).toBeInTheDocument();
  });

  test('creates a service token and reveals the secret once', async () => {
    const user = userEvent.setup({ delay: 10 });
    const createServiceToken = mockCreate();
    render(<ServiceTokenPageClient />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.type(screen.getByLabelText(/token name/i), 'CI token');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(createServiceToken).toHaveBeenCalledWith({
        username: 'bot-ci',
        tokenName: 'CI token',
        scopes: ['read:tap'],
        expires: null,
      });
    });

    expect(await screen.findByText('gt-new-secret')).toBeInTheDocument();
  });

  test('forwards supplied advanced metadata to createServiceToken', async () => {
    const user = userEvent.setup({ delay: 10 });
    const createServiceToken = mockCreate();
    render(<ServiceTokenPageClient />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.type(screen.getByLabelText(/token name/i), 'CI token');
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
        tokenName: 'CI token',
        scopes: ['read:tap'],
        expires: null,
        name: 'CI Bot',
        uid: 90000,
        groups: [{ name: 'g_developers', id: 1001 }],
      });
    });
  });

  test('surfaces a creation error via TokenCreationErrorDisplay', () => {
    mockCreate({
      error: { status: 422, message: 'Validation failed: bad scope' },
    });
    render(<ServiceTokenPageClient />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/error creating token/i);
    expect(alert).toHaveTextContent(/validation failed: bad scope/i);
  });

  test('shows a loading state while login info loads', () => {
    mockLogin({ loginInfo: null, isLoading: true });
    render(<ServiceTokenPageClient />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/bot username/i)).not.toBeInTheDocument();
  });

  test('shows an auth failure message when login info fails to load', () => {
    mockLogin({ loginInfo: null, error: new Error('boom') });
    render(<ServiceTokenPageClient />);

    expect(
      screen.getByText(/failed to load authentication information/i)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/bot username/i)).not.toBeInTheDocument();
  });

  test('shows a banner and disables the form when admin:token is absent', () => {
    mockLogin({
      loginInfo: { ...mockLoginInfo, scopes: ['exec:admin'] },
    });
    render(<ServiceTokenPageClient />);

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
    render(<ServiceTokenPageClient />);

    expect(
      screen.queryByText(/required to create service tokens/i)
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/bot username/i)).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /create service token/i })
    ).toBeEnabled();
  });
});
