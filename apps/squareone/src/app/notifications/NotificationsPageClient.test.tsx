import * as semaphoreClient from '@lsst-sqre/semaphore-client';
import { mockUserNotifications } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useSemaphoreUrlModule from '../../hooks/useSemaphoreUrl';
import NotificationsPageClient from './NotificationsPageClient';

vi.mock('@lsst-sqre/semaphore-client', async (importOriginal) => {
  const actual = await importOriginal<typeof semaphoreClient>();
  return {
    ...actual,
    useUserNotifications: vi.fn(),
  };
});
vi.mock('../../hooks/useSemaphoreUrl');

// Render AuthRequired as a transparent wrapper so the container's wiring can be
// exercised without a mocked auth backend; AuthRequired's own redirect/loading
// behavior is covered by its dedicated test.
vi.mock('../../components/AuthRequired', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-required">{children}</div>
  ),
}));

const mockUseUserNotifications = vi.mocked(
  semaphoreClient.useUserNotifications
);
const mockUseSemaphoreUrl = vi.mocked(useSemaphoreUrlModule.useSemaphoreUrl);

// The container owns the page size and passes it to the list query.
const PAGE_SIZE = 20;

function makeNotificationsReturn(
  overrides: Partial<semaphoreClient.UseUserNotificationsReturn> = {}
): semaphoreClient.UseUserNotificationsReturn {
  return {
    entries: mockUserNotifications,
    isLoading: false,
    isFetching: false,
    isLoadingMore: false,
    error: null,
    hasMore: false,
    totalCount: mockUserNotifications.length,
    loadMore: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  };
}

describe('NotificationsPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSemaphoreUrl.mockReturnValue('https://semaphore.example.com');
    mockUseUserNotifications.mockReturnValue(makeNotificationsReturn());
  });

  it('wraps its content in AuthRequired', () => {
    render(<NotificationsPageClient />);

    expect(screen.getByTestId('auth-required')).toBeInTheDocument();
  });

  it('fetches with the discovered Semaphore URL and the page size', () => {
    render(<NotificationsPageClient />);

    expect(mockUseUserNotifications).toHaveBeenCalledWith(
      'https://semaphore.example.com',
      { unread: false, limit: PAGE_SIZE }
    );
  });

  it('passes an empty URL through so the query stays disabled before discovery', () => {
    mockUseSemaphoreUrl.mockReturnValue(undefined);

    render(<NotificationsPageClient />);

    expect(mockUseUserNotifications).toHaveBeenCalledWith('', {
      unread: false,
      limit: PAGE_SIZE,
    });
  });

  it('shows the loading state, not the empty state, while discovery is pending', () => {
    mockUseSemaphoreUrl.mockReturnValue(undefined);
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({
        entries: undefined,
        isLoading: false,
        totalCount: null,
      })
    );

    render(<NotificationsPageClient />);

    expect(screen.getByText(/loading notifications/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/you have no notifications/i)
    ).not.toBeInTheDocument();
  });

  it('renders the notifications table', () => {
    render(<NotificationsPageClient />);

    expect(
      screen.getByText(/showing 6 of 6 notifications/i)
    ).toBeInTheDocument();
  });

  it('renders a loading state', () => {
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({ entries: undefined, isLoading: true })
    );

    render(<NotificationsPageClient />);

    expect(screen.getByText(/loading notifications/i)).toBeInTheDocument();
  });

  it('loads more pages', async () => {
    const user = userEvent.setup();
    const loadMore = vi.fn();
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({ hasMore: true, loadMore })
    );

    render(<NotificationsPageClient />);

    await user.click(screen.getByRole('button', { name: /load more/i }));

    expect(loadMore).toHaveBeenCalled();
  });

  it('retries via refetch on error', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({
        entries: undefined,
        error: new Error('Boom'),
        refetch,
      })
    );

    render(<NotificationsPageClient />);

    await user.click(screen.getByRole('button', { name: /retry/i }));

    expect(refetch).toHaveBeenCalled();
  });

  it('refetches unread-only when the toggle is switched on', async () => {
    const user = userEvent.setup();

    render(<NotificationsPageClient />);

    await user.click(
      screen.getByRole('checkbox', { name: /show unread only/i })
    );

    expect(mockUseUserNotifications).toHaveBeenCalledWith(
      'https://semaphore.example.com',
      { unread: true, limit: PAGE_SIZE }
    );
  });
});
