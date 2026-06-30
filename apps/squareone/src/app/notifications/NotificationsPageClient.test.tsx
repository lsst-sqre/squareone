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
const mockUseSemaphoreUrl = vi.mocked(useSemaphoreUrlModule.useSemaphoreUrl);

// The container owns the page size and passes it to the list query.
const PAGE_SIZE = 20;

const markReadMutate = vi.fn();

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
    vi.mocked(useStaticConfig).mockReturnValue({
      baseUrl: 'https://example.test',
    } as AppConfig);
    mockUseSemaphoreUrl.mockReturnValue('https://semaphore.example.com');
    mockUseUserNotifications.mockReturnValue(makeNotificationsReturn());
    mockUseUserNotification.mockReturnValue(makeNotificationReturn());
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

    // It enumerates the unread notifications…
    expect(mockFetchUserNotifications).toHaveBeenCalledWith(
      'https://semaphore.example.com',
      { unread: true }
    );

    // …then marks that enumerated set read through the same mutation that
    // invalidates the list, the unread count, and each affected detail.
    await waitFor(() => {
      expect(markReadMutate).toHaveBeenCalledWith({
        ids: ['ntf-001', 'ntf-003'],
        csrfToken: 'csrf-token-xyz',
      });
    });
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
