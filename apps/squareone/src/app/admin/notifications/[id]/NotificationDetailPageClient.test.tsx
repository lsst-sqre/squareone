import * as semaphoreClient from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useSemaphoreUrlModule from '@/hooks/useSemaphoreUrl';

import NotificationDetailPageClient from './NotificationDetailPageClient';

vi.mock('@lsst-sqre/semaphore-client', async (importOriginal) => {
  const actual = await importOriginal<typeof semaphoreClient>();
  return {
    ...actual,
    useAdminNotification: vi.fn(),
  };
});
vi.mock('@/hooks/useSemaphoreUrl');

const mockUseAdminNotification = vi.mocked(
  semaphoreClient.useAdminNotification
);
const mockUseSemaphoreUrlState = vi.mocked(
  useSemaphoreUrlModule.useSemaphoreUrlState
);

const notification: semaphoreClient.UserNotification = {
  id: 'ntf-001',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  sender: 'bot-quota-notifier',
  recipient: 'alice',
  summary: 'Approaching your quota',
  body: 'Details here.',
};

function mockNotificationReturn(
  overrides: Partial<semaphoreClient.UseAdminNotificationReturn> = {}
) {
  mockUseAdminNotification.mockReturnValue({
    notification: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  });
}

describe('NotificationDetailPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSemaphoreUrlState.mockReturnValue({
      url: 'https://semaphore.example.com',
      isResolving: false,
      isUnavailable: false,
    });
    mockNotificationReturn();
  });

  it('queries with the resolved Semaphore URL and id, and renders the notification', () => {
    mockNotificationReturn({ notification });

    render(<NotificationDetailPageClient id="ntf-001" />);

    expect(mockUseAdminNotification).toHaveBeenCalledWith(
      'https://semaphore.example.com',
      'ntf-001'
    );
    expect(screen.getByText('ntf-001')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('shows a loading state while Semaphore discovery is still pending', () => {
    mockUseSemaphoreUrlState.mockReturnValue({
      url: undefined,
      isResolving: true,
      isUnavailable: false,
    });

    render(<NotificationDetailPageClient id="ntf-001" />);

    expect(screen.getByText('Loading notification…')).toBeInTheDocument();
  });

  it('shows a terminal unavailable state when Semaphore is undiscoverable', () => {
    mockUseSemaphoreUrlState.mockReturnValue({
      url: undefined,
      isResolving: false,
      isUnavailable: true,
    });

    render(<NotificationDetailPageClient id="ntf-001" />);

    // Not an infinite spinner and not a misleading "not found".
    expect(screen.queryByText('Loading notification…')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Notification not found')
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/notification service is currently unavailable/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Return to notifications' })
    ).toHaveAttribute('href', '/admin/notifications');
  });

  it('surfaces a not-found state when the query errors', () => {
    mockNotificationReturn({
      isError: true,
      error: Object.assign(new Error('Semaphore API error: 404 Not Found'), {
        statusCode: 404,
      }),
    });

    render(<NotificationDetailPageClient id="missing" />);

    expect(screen.getByText('Notification not found')).toBeInTheDocument();
  });
});
