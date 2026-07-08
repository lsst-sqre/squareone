import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import * as semaphoreClient from '@lsst-sqre/semaphore-client';
import { mockUserNotifications } from '@lsst-sqre/semaphore-client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useSemaphoreUrlModule from '../../hooks/useSemaphoreUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';
import type { AppConfig } from '../../lib/config/loader';
import NotificationsPageClient from './NotificationsPageClient';

vi.mock('@lsst-sqre/semaphore-client', async (importOriginal) => {
  const actual = await importOriginal<typeof semaphoreClient>();
  return {
    ...actual,
    useUserNotifications: vi.fn(),
    useUserNotification: vi.fn(),
    useMarkNotificationsRead: vi.fn(),
    fetchUserNotifications: vi.fn(),
  };
});
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useLoginInfo: vi.fn(),
}));
vi.mock('../../hooks/useSemaphoreUrl');
vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: (): string | undefined => 'https://repertoire.example.com',
}));
// The container reads `baseUrl` from static config to build copy-link
// permalinks; mock it so the component renders without a ConfigProvider.
vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

// The "Show unread only" filter is URL-driven (via useUnreadOnlyFilter), so the
// App Router navigation hooks must be mocked: the URL is the source of truth for
// the filter, and toggling it pushes a new URL. `mockSearchParams` stands in for
// the current query string; `mockPush` captures navigations.
const mockPush = vi.fn();
const mockPathname = '/notifications';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

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
const mockUseUserNotification = vi.mocked(semaphoreClient.useUserNotification);
const mockUseMarkNotificationsRead = vi.mocked(
  semaphoreClient.useMarkNotificationsRead
);
const mockFetchUserNotifications = vi.mocked(
  semaphoreClient.fetchUserNotifications
);
const mockUseLoginInfo = vi.mocked(useLoginInfo);
const mockUseSemaphoreUrlState = vi.mocked(
  useSemaphoreUrlModule.useSemaphoreUrlState
);

// The container owns the page size and passes it to the list query.
const PAGE_SIZE = 20;

// Page size the container uses when enumerating the full unread set for
// "Mark all as read".
const MARK_ALL_PAGE_SIZE = 100;

const markReadMutate = vi.fn();
const markReadMutateAsync = vi.fn();

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

function makeNotificationReturn(
  overrides: Partial<semaphoreClient.UseUserNotificationReturn> = {}
): semaphoreClient.UseUserNotificationReturn {
  return {
    notification: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

const unreadDetail: semaphoreClient.UserNotificationFormatted = {
  id: 'ntf-001',
  created: '2026-06-12T17:10:32+00:00',
  read: null,
  summary: {
    gfm: 'You are approaching your disk space **quota** limit',
    html: '<p>You are approaching your disk space <strong>quota</strong> limit</p>',
  },
  body: {
    gfm: 'You are using **448GiB** of your 500GiB quota.',
    html: '<p>You are using <strong>448GiB</strong> of your 500GiB quota.</p>',
  },
};

describe('NotificationsPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.mocked(useStaticConfig).mockReturnValue({
      baseUrl: 'https://example.test',
    } as AppConfig);
    mockUseSemaphoreUrlState.mockReturnValue({
      url: 'https://semaphore.example.com',
      isResolving: false,
      isUnavailable: false,
    });
    mockUseUserNotifications.mockReturnValue(makeNotificationsReturn());
    mockUseUserNotification.mockReturnValue(makeNotificationReturn());
    markReadMutateAsync.mockResolvedValue(undefined);
    mockUseMarkNotificationsRead.mockReturnValue({
      mutate: markReadMutate,
      mutateAsync: markReadMutateAsync,
    } as unknown as ReturnType<
      typeof semaphoreClient.useMarkNotificationsRead
    >);
    mockUseLoginInfo.mockReturnValue({
      csrfToken: 'csrf-token-xyz',
    } as unknown as ReturnType<typeof useLoginInfo>);
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
    mockUseSemaphoreUrlState.mockReturnValue({
      url: undefined,
      isResolving: true,
      isUnavailable: false,
    });

    render(<NotificationsPageClient />);

    expect(mockUseUserNotifications).toHaveBeenCalledWith('', {
      unread: false,
      limit: PAGE_SIZE,
    });
  });

  it('shows the loading state, not the empty state, while discovery is pending', () => {
    mockUseSemaphoreUrlState.mockReturnValue({
      url: undefined,
      isResolving: true,
      isUnavailable: false,
    });
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

  it('shows a terminal unavailable state when Semaphore is undiscoverable', () => {
    mockUseSemaphoreUrlState.mockReturnValue({
      url: undefined,
      isResolving: false,
      isUnavailable: true,
    });
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({
        entries: undefined,
        isLoading: false,
        totalCount: null,
      })
    );

    render(<NotificationsPageClient />);

    // Not an eternal spinner and not a misleading empty state.
    expect(
      screen.queryByText(/loading notifications/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/you have no notifications/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/notification service is currently unavailable/i)
    ).toBeInTheDocument();
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

  it('fetches unread-only when the URL carries unread=true', () => {
    // The URL is the source of truth for the filter, so a bookmarked
    // `/notifications?unread=true` fetches the unread-only list.
    mockSearchParams = new URLSearchParams({ unread: 'true' });

    render(<NotificationsPageClient />);

    expect(mockUseUserNotifications).toHaveBeenCalledWith(
      'https://semaphore.example.com',
      { unread: true, limit: PAGE_SIZE }
    );
  });

  it('reflects the "Show unread only" toggle into the URL', async () => {
    const user = userEvent.setup();

    render(<NotificationsPageClient />);

    await user.click(
      screen.getByRole('checkbox', { name: /show unread only/i })
    );

    // Toggling pushes the filtered URL (without scrolling to the top); the
    // resulting navigation is what re-drives the query in production.
    expect(mockPush).toHaveBeenCalledWith('/notifications?unread=true', {
      scroll: false,
    });
  });

  it('expands a row to fetch its body and auto-marks an unread message read', async () => {
    const user = userEvent.setup();
    mockUseUserNotification.mockReturnValue(
      makeNotificationReturn({ notification: unreadDetail })
    );

    render(<NotificationsPageClient />);

    const expanders = screen.getAllByRole('button', {
      name: /show message/i,
    });
    await user.click(expanders[0]);

    // The body is fetched for the expanded row and rendered in place…
    expect(mockUseUserNotification).toHaveBeenCalledWith(
      'https://semaphore.example.com',
      'ntf-001'
    );
    expect(screen.getByText('448GiB')).toBeInTheDocument();

    // …and the unread message is auto-marked read through the mutation.
    expect(markReadMutate).toHaveBeenCalledWith({
      ids: ['ntf-001'],
      csrfToken: 'csrf-token-xyz',
    });
  });

  it('marks the selected rows read through the mutation', async () => {
    const user = userEvent.setup();

    render(<NotificationsPageClient />);

    // Select the first row (ntf-001), open the Actions dropdown, mark it read.
    await user.click(
      screen.getAllByRole('checkbox', { name: /select notification/i })[0]
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    expect(markReadMutate).toHaveBeenCalledWith({
      ids: ['ntf-001'],
      csrfToken: 'csrf-token-xyz',
    });
  });

  it('marks all matching read by enumerating the unread ids when selection is extended across pages', async () => {
    const user = userEvent.setup();
    // More pages exist than are loaded, so selecting all enables the across-
    // pages extension banner.
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({ hasMore: true, totalCount: 12 })
    );
    // The unread enumeration query (?unread=true) returns the unread summaries.
    mockFetchUserNotifications.mockResolvedValue({
      entries: [
        mockUserNotifications[0], // ntf-001 (unread)
        mockUserNotifications[2], // ntf-003 (unread)
      ],
      nextCursor: null,
      totalCount: 2,
    });

    render(<NotificationsPageClient />);

    // Select the loaded rows, extend the selection across pages, then mark read.
    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(
      screen.getByRole('button', { name: /select all 12 notifications/i })
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    // It enumerates the unread notifications with an explicit page size…
    expect(mockFetchUserNotifications).toHaveBeenCalledWith(
      'https://semaphore.example.com',
      { unread: true, limit: MARK_ALL_PAGE_SIZE, cursor: null }
    );
    // …and stops after one request when there is no next cursor…
    expect(mockFetchUserNotifications).toHaveBeenCalledTimes(1);

    // …then marks that enumerated set read through the same mutation that
    // invalidates the list, the unread count, and each affected detail. The
    // async form is used so a mark-read failure rejects back to the view.
    await waitFor(() => {
      expect(markReadMutateAsync).toHaveBeenCalledWith({
        ids: ['ntf-001', 'ntf-003'],
        csrfToken: 'csrf-token-xyz',
      });
    });
  });

  it('follows the cursor across pages so every unread id is marked read', async () => {
    const user = userEvent.setup();
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({ hasMore: true, totalCount: 12 })
    );
    // The unread set spans two pages of the enumeration; the second page is
    // requested with the first page's cursor.
    mockFetchUserNotifications
      .mockResolvedValueOnce({
        entries: [mockUserNotifications[0]], // ntf-001 (unread)
        nextCursor: 'cursor-page-2',
        totalCount: 2,
      })
      .mockResolvedValueOnce({
        entries: [mockUserNotifications[2]], // ntf-003 (unread)
        nextCursor: null,
        totalCount: 2,
      });

    render(<NotificationsPageClient />);

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(
      screen.getByRole('button', { name: /select all 12 notifications/i })
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    // The ids from every page — not just the first — are marked read.
    await waitFor(() => {
      expect(markReadMutateAsync).toHaveBeenCalledWith({
        ids: ['ntf-001', 'ntf-003'],
        csrfToken: 'csrf-token-xyz',
      });
    });

    // The enumeration walked the cursor to exhaustion.
    expect(mockFetchUserNotifications).toHaveBeenCalledTimes(2);
    expect(mockFetchUserNotifications).toHaveBeenNthCalledWith(
      1,
      'https://semaphore.example.com',
      { unread: true, limit: MARK_ALL_PAGE_SIZE, cursor: null }
    );
    expect(mockFetchUserNotifications).toHaveBeenNthCalledWith(
      2,
      'https://semaphore.example.com',
      { unread: true, limit: MARK_ALL_PAGE_SIZE, cursor: 'cursor-page-2' }
    );
  });

  it('stops enumerating when the server repeats a cursor instead of looping forever', async () => {
    const user = userEvent.setup();
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({ hasMore: true, totalCount: 12 })
    );
    // A misbehaving server returns the same next cursor on every page.
    mockFetchUserNotifications
      .mockResolvedValueOnce({
        entries: [mockUserNotifications[0]], // ntf-001 (unread)
        nextCursor: 'stuck-cursor',
        totalCount: 2,
      })
      .mockResolvedValue({
        entries: [mockUserNotifications[2]], // ntf-003 (unread)
        nextCursor: 'stuck-cursor',
        totalCount: 2,
      });

    render(<NotificationsPageClient />);

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(
      screen.getByRole('button', { name: /select all 12 notifications/i })
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    // The walk terminates after the repeated cursor and still marks what it
    // enumerated.
    await waitFor(() => {
      expect(markReadMutateAsync).toHaveBeenCalledWith({
        ids: ['ntf-001', 'ntf-003'],
        csrfToken: 'csrf-token-xyz',
      });
    });
    expect(mockFetchUserNotifications).toHaveBeenCalledTimes(2);
  });

  it('rejects and keeps the selection when a later enumeration page fails', async () => {
    const user = userEvent.setup();
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({ hasMore: true, totalCount: 12 })
    );
    // The first page succeeds but the cursor-follow request fails mid-walk.
    mockFetchUserNotifications
      .mockResolvedValueOnce({
        entries: [mockUserNotifications[0]], // ntf-001 (unread)
        nextCursor: 'cursor-page-2',
        totalCount: 2,
      })
      .mockRejectedValueOnce(
        new semaphoreClient.SemaphoreError('Semaphore API error: 500', 500)
      );

    render(<NotificationsPageClient />);

    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(
      screen.getByRole('button', { name: /select all 12 notifications/i })
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    // The mid-walk failure is surfaced inline, the selection is kept, and no
    // partial set was marked read.
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/failed to mark notifications as read/i);
    expect(screen.getByText(/all 12 selected/i)).toBeInTheDocument();
    expect(markReadMutateAsync).not.toHaveBeenCalled();
  });

  it('surfaces an enumeration failure and keeps the selection when marking all matching read', async () => {
    const user = userEvent.setup();
    mockUseUserNotifications.mockReturnValue(
      makeNotificationsReturn({ hasMore: true, totalCount: 12 })
    );
    // The unread enumeration query (?unread=true) fails, e.g. a Semaphore 500.
    mockFetchUserNotifications.mockRejectedValue(
      new semaphoreClient.SemaphoreError('Semaphore API error: 500', 500)
    );

    render(<NotificationsPageClient />);

    // Select the loaded rows, extend the selection across pages, then mark read.
    await user.click(screen.getByRole('checkbox', { name: /select all/i }));
    await user.click(
      screen.getByRole('button', { name: /select all 12 notifications/i })
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: /mark as read/i }));

    // The failure is surfaced inline rather than swallowed…
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/failed to mark notifications as read/i);
    expect(alert).toHaveTextContent(/semaphore api error: 500/i);

    // …the selection is kept so the user can retry…
    expect(screen.getByText(/all 12 selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();

    // …and nothing was marked read.
    expect(markReadMutateAsync).not.toHaveBeenCalled();
    expect(markReadMutate).not.toHaveBeenCalled();
  });

  it('does not re-mark an already-read message when its body is shown', async () => {
    const user = userEvent.setup();
    mockUseUserNotification.mockReturnValue(
      makeNotificationReturn({
        notification: {
          ...unreadDetail,
          read: '2026-06-12T18:00:00+00:00',
        },
      })
    );

    render(<NotificationsPageClient />);

    const expanders = screen.getAllByRole('button', {
      name: /show message/i,
    });
    await user.click(expanders[0]);

    expect(screen.getByText('448GiB')).toBeInTheDocument();
    expect(markReadMutate).not.toHaveBeenCalled();
  });
});
