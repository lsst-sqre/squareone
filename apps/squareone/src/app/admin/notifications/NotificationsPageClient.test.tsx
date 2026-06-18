import * as semaphoreClient from '@lsst-sqre/semaphore-client';
import { mockAdminNotifications } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useAdminNotificationFiltersModule from '../../../hooks/useAdminNotificationFilters';
import * as useSemaphoreUrlModule from '../../../hooks/useSemaphoreUrl';
import NotificationsPageClient from './NotificationsPageClient';

vi.mock('@lsst-sqre/semaphore-client', async (importOriginal) => {
  const actual = await importOriginal<typeof semaphoreClient>();
  return {
    ...actual,
    useAdminNotifications: vi.fn(),
  };
});
vi.mock('../../../hooks/useSemaphoreUrl');
vi.mock('../../../hooks/useAdminNotificationFilters');

const mockUseAdminNotifications = vi.mocked(
  semaphoreClient.useAdminNotifications
);
const mockUseSemaphoreUrl = vi.mocked(useSemaphoreUrlModule.useSemaphoreUrl);
const mockUseAdminNotificationFilters = vi.mocked(
  useAdminNotificationFiltersModule.default
);

function makeNotificationsReturn(
  overrides: Partial<semaphoreClient.UseAdminNotificationsReturn> = {}
): semaphoreClient.UseAdminNotificationsReturn {
  return {
    entries: mockAdminNotifications,
    isLoading: false,
    isFetching: false,
    isLoadingMore: false,
    error: null,
    hasMore: false,
    totalCount: mockAdminNotifications.length,
    loadMore: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  };
}

describe('NotificationsPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSemaphoreUrl.mockReturnValue('https://semaphore.example.com');
    mockUseAdminNotificationFilters.mockReturnValue({
      filters: {},
      setFilter: vi.fn(),
      clearAllFilters: vi.fn(),
    });
    mockUseAdminNotifications.mockReturnValue(makeNotificationsReturn());
  });

  it('fetches with the discovered Semaphore URL and the current filters', () => {
    mockUseSemaphoreUrl.mockReturnValue('https://semaphore.example.com');
    mockUseAdminNotificationFilters.mockReturnValue({
      filters: { recipient: 'alice' },
      setFilter: vi.fn(),
      clearAllFilters: vi.fn(),
    });

    render(<NotificationsPageClient />);

    expect(mockUseAdminNotifications).toHaveBeenCalledWith(
      'https://semaphore.example.com',
      { recipient: 'alice' }
    );
  });

  it('passes an empty URL through so the query stays disabled before discovery', () => {
    mockUseSemaphoreUrl.mockReturnValue(undefined);

    render(<NotificationsPageClient />);

    expect(mockUseAdminNotifications).toHaveBeenCalledWith('', {});
  });

  it('renders the notifications table', () => {
    render(<NotificationsPageClient />);

    expect(screen.getAllByText('alice').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/showing 8 of 8 notifications/i)
    ).toBeInTheDocument();
  });

  it('renders a loading state', () => {
    mockUseAdminNotifications.mockReturnValue(
      makeNotificationsReturn({ entries: undefined, isLoading: true })
    );

    render(<NotificationsPageClient />);

    expect(screen.getByText(/loading notifications/i)).toBeInTheDocument();
  });

  it('routes a filter change through setFilter', async () => {
    const user = userEvent.setup();
    const setFilter = vi.fn();
    mockUseAdminNotificationFilters.mockReturnValue({
      filters: {},
      setFilter,
      clearAllFilters: vi.fn(),
    });

    render(<NotificationsPageClient />);

    await user.type(screen.getByLabelText(/filter by recipient/i), 'a');

    expect(setFilter).toHaveBeenCalledWith('recipient', 'a');
  });

  it('clears filters via clearAllFilters', async () => {
    const user = userEvent.setup();
    const clearAllFilters = vi.fn();
    mockUseAdminNotificationFilters.mockReturnValue({
      filters: { recipient: 'alice' },
      setFilter: vi.fn(),
      clearAllFilters,
    });

    render(<NotificationsPageClient />);

    await user.click(
      screen.getByRole('button', { name: /clear all filters/i })
    );

    expect(clearAllFilters).toHaveBeenCalled();
  });

  it('loads more pages', async () => {
    const user = userEvent.setup();
    const loadMore = vi.fn();
    mockUseAdminNotifications.mockReturnValue(
      makeNotificationsReturn({ hasMore: true, loadMore })
    );

    render(<NotificationsPageClient />);

    await user.click(screen.getByRole('button', { name: /load more/i }));

    expect(loadMore).toHaveBeenCalled();
  });

  it('retries via refetch on error', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    mockUseAdminNotifications.mockReturnValue(
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
});
