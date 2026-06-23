import { type LoginInfo, useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { useCreateAdminNotification } from '@lsst-sqre/semaphore-client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useSemaphoreUrl } from '../../../../hooks/useSemaphoreUrl';
import NewNotificationPageClient from './NewNotificationPageClient';

vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useLoginInfo: vi.fn(),
}));

vi.mock('@lsst-sqre/semaphore-client', () => ({
  useCreateAdminNotification: vi.fn(),
}));

vi.mock('../../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => 'https://example.com/repertoire',
}));

vi.mock('../../../../hooks/useSemaphoreUrl', () => ({
  useSemaphoreUrl: vi.fn(),
}));

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

const mockLoginInfo: LoginInfo = {
  csrf: 'csrf-token-123',
  username: 'admin',
  scopes: ['exec:admin', 'admin:notifications'],
  config: { scopes: [] },
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

function mockCreate() {
  const mutateAsync = vi.fn().mockResolvedValue({
    id: 'n-1',
    recipient: 'rachel',
    summary: 'Heads up',
  });
  vi.mocked(useCreateAdminNotification).mockReturnValue({
    mutateAsync,
    isPending: false,
    // biome-ignore lint/suspicious/noExplicitAny: only mutateAsync/isPending are used by the page
  } as any);
  return mutateAsync;
}

describe('NewNotificationPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockLogin();
    mockCreate();
    vi.mocked(useSemaphoreUrl).mockReturnValue('https://example.com/semaphore');
  });

  test('renders the compose heading and form', () => {
    render(<NewNotificationPageClient />);

    expect(
      screen.getByRole('heading', { level: 1, name: /send a notification/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/recipient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/summary/i)).toBeInTheDocument();
  });

  test('shows a loading state while login info loads', () => {
    mockLogin({ loginInfo: null, isLoading: true });
    render(<NewNotificationPageClient />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/recipient/i)).not.toBeInTheDocument();
  });

  test('shows an auth failure message when login info fails to load', () => {
    mockLogin({ loginInfo: null, error: new Error('boom') });
    render(<NewNotificationPageClient />);

    expect(
      screen.getByText(/failed to load authentication information/i)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/recipient/i)).not.toBeInTheDocument();
  });

  test('shows an explanatory note and disables the form without admin:notifications', () => {
    mockLogin({ loginInfo: { ...mockLoginInfo, scopes: ['exec:admin'] } });
    render(<NewNotificationPageClient />);

    expect(
      screen.getByText(/required to send notifications/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/recipient/i)).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /send notification/i })
    ).toBeDisabled();
  });

  test('shows a service-unavailable note and disables the form while Semaphore is undiscovered', () => {
    // Login has resolved with the admin:notifications scope, but Semaphore
    // discovery is still pending (or Semaphore is undiscovered), so the base
    // URL is undefined. The form must not be submittable into a relative URL.
    vi.mocked(useSemaphoreUrl).mockReturnValue(undefined);
    render(<NewNotificationPageClient />);

    expect(
      screen.getByText(/notification service is currently unavailable/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/recipient/i)).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /send notification/i })
    ).toBeDisabled();
  });

  test('enables the form and shows no note when admin:notifications is present', () => {
    render(<NewNotificationPageClient />);

    expect(
      screen.queryByText(/required to send notifications/i)
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/recipient/i)).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /send notification/i })
    ).toBeEnabled();
  });

  test('sends the notification and redirects to the listing', async () => {
    const user = userEvent.setup({ delay: 10 });
    const mutateAsync = mockCreate();
    render(<NewNotificationPageClient />);

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        notification: { recipient: 'rachel', summary: 'Heads up' },
        csrfToken: 'csrf-token-123',
      });
    });
    expect(mockPush).toHaveBeenCalledWith('/admin/notifications');
  });

  test('sends the body when provided', async () => {
    const user = userEvent.setup({ delay: 10 });
    const mutateAsync = mockCreate();
    render(<NewNotificationPageClient />);

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.type(screen.getByLabelText(/^body/i), 'Full **details**.');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        notification: {
          recipient: 'rachel',
          summary: 'Heads up',
          body: 'Full **details**.',
        },
        csrfToken: 'csrf-token-123',
      });
    });
  });

  test('stays on the page with a success confirmation when "draft another" is checked', async () => {
    const user = userEvent.setup({ delay: 10 });
    mockCreate();
    render(<NewNotificationPageClient />);

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.click(screen.getByRole('checkbox', { name: /draft another/i }));
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    expect(await screen.findByText(/notification sent/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('shows a clear error and does not redirect when the send fails', async () => {
    const user = userEvent.setup({ delay: 10 });
    mockCreate();
    vi.mocked(useCreateAdminNotification).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error('Server error')),
      isPending: false,
      // biome-ignore lint/suspicious/noExplicitAny: only mutateAsync/isPending are used by the page
    } as any);
    render(<NewNotificationPageClient />);

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('navigates back to the listing when Cancel is clicked', async () => {
    const user = userEvent.setup({ delay: 10 });
    render(<NewNotificationPageClient />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith('/admin/notifications');
  });

  describe('query-parameter prefilling', () => {
    test('prefills recipient, summary, and body from query params', () => {
      mockSearchParams = new URLSearchParams(
        'recipient=rachel&summary=Heads+up&body=Full+details'
      );
      render(<NewNotificationPageClient />);

      expect(screen.getByLabelText(/recipient/i)).toHaveValue('rachel');
      expect(screen.getByLabelText(/summary/i)).toHaveValue('Heads up');
      expect(screen.getByLabelText(/^body/i)).toHaveValue('Full details');
    });

    test('leaves fields empty when no query params are present', () => {
      render(<NewNotificationPageClient />);

      expect(screen.getByLabelText(/recipient/i)).toHaveValue('');
      expect(screen.getByLabelText(/summary/i)).toHaveValue('');
      expect(screen.getByLabelText(/^body/i)).toHaveValue('');
    });
  });
});
