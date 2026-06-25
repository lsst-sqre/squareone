import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import * as semaphoreClient from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useSemaphoreUrlModule from '../../../hooks/useSemaphoreUrl';
import NotificationDetailPageClient from './NotificationDetailPageClient';

vi.mock('@lsst-sqre/semaphore-client', async (importOriginal) => {
  const actual = await importOriginal<typeof semaphoreClient>();
  return {
    ...actual,
    useUserNotification: vi.fn(),
    useMarkNotificationsRead: vi.fn(),
  };
});
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useLoginInfo: vi.fn(),
}));
vi.mock('../../../hooks/useSemaphoreUrl');
vi.mock('../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => 'https://repertoire.example.com',
}));

// Render AuthRequired as a transparent wrapper so the container's wiring can be
// exercised without a mocked auth backend; AuthRequired's own redirect/loading
// behavior is covered by its dedicated test.
vi.mock('../../../components/AuthRequired', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-required">{children}</div>
  ),
}));

const mockUseUserNotification = vi.mocked(semaphoreClient.useUserNotification);
const mockUseMarkNotificationsRead = vi.mocked(
  semaphoreClient.useMarkNotificationsRead
);
const mockUseLoginInfo = vi.mocked(useLoginInfo);
const mockUseSemaphoreUrlState = vi.mocked(
  useSemaphoreUrlModule.useSemaphoreUrlState
);

const markReadMutate = vi.fn();

const notification: semaphoreClient.UserNotificationFormatted = {
  id: 'ntf-001',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  summary: {
    gfm: 'Approaching your quota',
    html: '<p>Approaching your quota</p>',
  },
  body: { gfm: 'Details here.', html: '<p>Details here.</p>' },
};

function mockNotificationReturn(
  overrides: Partial<semaphoreClient.UseUserNotificationReturn> = {}
) {
  mockUseUserNotification.mockReturnValue({
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
    mockUseMarkNotificationsRead.mockReturnValue({
      mutate: markReadMutate,
    } as unknown as ReturnType<
      typeof semaphoreClient.useMarkNotificationsRead
    >);
    mockUseLoginInfo.mockReturnValue({
      csrfToken: 'csrf-token-xyz',
    } as unknown as ReturnType<typeof useLoginInfo>);
  });

  it('wraps its content in AuthRequired', () => {
    render(<NotificationDetailPageClient id="ntf-001" />);

    expect(screen.getByTestId('auth-required')).toBeInTheDocument();
  });

  it('queries with the resolved Semaphore URL and id, and renders the notification', () => {
    mockNotificationReturn({ notification });

    render(<NotificationDetailPageClient id="ntf-001" />);

    expect(mockUseUserNotification).toHaveBeenCalledWith(
      'https://semaphore.example.com',
      'ntf-001'
    );
    expect(screen.getByText('ntf-001')).toBeInTheDocument();
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

  it('auto-marks an unread notification read once it loads', () => {
    // The fixture is unread (`read: null`).
    mockNotificationReturn({ notification });

    render(<NotificationDetailPageClient id="ntf-001" />);

    expect(markReadMutate).toHaveBeenCalledWith({
      ids: ['ntf-001'],
      csrfToken: 'csrf-token-xyz',
    });
  });

  it('does not mark an already-read notification', () => {
    mockNotificationReturn({
      notification: { ...notification, read: '2026-06-12T18:00:00+00:00' },
    });

    render(<NotificationDetailPageClient id="ntf-001" />);

    expect(markReadMutate).not.toHaveBeenCalled();
  });

  it('does not mark before the notification has loaded', () => {
    // Default mock: notification is still undefined.
    render(<NotificationDetailPageClient id="ntf-001" />);

    expect(markReadMutate).not.toHaveBeenCalled();
  });
});
