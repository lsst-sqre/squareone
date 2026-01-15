import type { TokenChangeHistoryEntry } from '@lsst-sqre/gafaelfawr-client';
import * as gafaelfawrClient from '@lsst-sqre/gafaelfawr-client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useRepertoireUrlModule from '../../hooks/useRepertoireUrl';
import * as useTokenHistoryFiltersModule from '../../hooks/useTokenHistoryFilters';
import TokenHistoryView from './TokenHistoryView';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/test',
    query: {},
  }),
}));

// Mock hooks
vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => {
  const actual = await importOriginal<typeof gafaelfawrClient>();
  return {
    ...actual,
    useTokenChangeHistory: vi.fn(),
  };
});
vi.mock('../../hooks/useRepertoireUrl');
vi.mock('../../hooks/useTokenHistoryFilters');

const mockUseTokenChangeHistory = vi.mocked(
  gafaelfawrClient.useTokenChangeHistory
);
const mockUseRepertoireUrl = vi.mocked(useRepertoireUrlModule.useRepertoireUrl);
const mockUseTokenHistoryFilters = vi.mocked(
  useTokenHistoryFiltersModule.default
);

describe('TokenHistoryView', () => {
  const mockEntries: TokenChangeHistoryEntry[] = [
    {
      token: 'abc123xyz456789012345',
      username: 'testuser',
      token_type: 'user',
      token_name: 'Test Token',
      parent: null,
      scopes: ['read:tap'],
      service: null,
      expires: Date.now() / 1000 + 86400,
      actor: 'testuser',
      action: 'create',
      old_token_name: null,
      old_scopes: null,
      old_expires: null,
      ip_address: '192.168.1.1',
      event_time: Date.now() / 1000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseRepertoireUrl.mockReturnValue(undefined);

    mockUseTokenHistoryFilters.mockReturnValue({
      filters: {},
      setFilter: vi.fn(),
      clearFilter: vi.fn(),
      clearAllFilters: vi.fn(),
      setIpAddressFilter: vi.fn(),
    });

    mockUseTokenChangeHistory.mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      isFetching: false,
      error: null,
      hasMore: false,
      totalCount: 1,
      loadMore: vi.fn(),
      isLoadingMore: false,
      refetch: vi.fn(),
    });
  });

  it('renders loading state', () => {
    mockUseTokenChangeHistory.mockReturnValue({
      entries: undefined,
      isLoading: true,
      isFetching: true,
      error: null,
      hasMore: false,
      totalCount: null,
      loadMore: vi.fn(),
      isLoadingMore: false,
      refetch: vi.fn(),
    });

    render(<TokenHistoryView username="testuser" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state with retry button', async () => {
    const mockError = new Error('Failed to fetch');
    mockUseTokenChangeHistory.mockReturnValue({
      entries: undefined,
      isLoading: false,
      isFetching: false,
      error: mockError,
      hasMore: false,
      totalCount: null,
      loadMore: vi.fn(),
      isLoadingMore: false,
      refetch: vi.fn(),
    });

    render(<TokenHistoryView username="testuser" />);

    expect(
      screen.getByText('Failed to load token history')
    ).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders empty state when no entries', () => {
    mockUseTokenChangeHistory.mockReturnValue({
      entries: [],
      isLoading: false,
      isFetching: false,
      error: null,
      hasMore: false,
      totalCount: 0,
      loadMore: vi.fn(),
      isLoadingMore: false,
      refetch: vi.fn(),
    });

    render(<TokenHistoryView username="testuser" />);

    expect(screen.getByText('No token history found')).toBeInTheDocument();
  });

  it('renders history entries', () => {
    render(<TokenHistoryView username="testuser" />);

    expect(screen.getByText(/Test Token/)).toBeInTheDocument();
  });

  it('shows filters when showFilters={true}', () => {
    render(<TokenHistoryView username="testuser" showFilters={true} />);

    expect(screen.getByLabelText(/filter by start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by token key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by ip address/i)).toBeInTheDocument();
  });

  it('hides filters when showFilters={false}', () => {
    render(<TokenHistoryView username="testuser" showFilters={false} />);

    expect(
      screen.queryByLabelText(/filter by start date/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/filter by end date/i)
    ).not.toBeInTheDocument();
  });

  it('uses token prop to pre-filter history', () => {
    const tokenKey = 'abc123xyz456789012345';
    render(
      <TokenHistoryView
        username="testuser"
        token={tokenKey}
        showFilters={false}
      />
    );

    expect(mockUseTokenChangeHistory).toHaveBeenCalledWith(
      'testuser',
      {
        tokenType: undefined,
        token: tokenKey,
        since: undefined,
        until: undefined,
        ipAddress: undefined,
      },
      undefined
    );
  });

  it('passes initialTokenType to hook', () => {
    render(<TokenHistoryView username="testuser" initialTokenType="user" />);

    expect(mockUseTokenChangeHistory).toHaveBeenCalledWith(
      'testuser',
      expect.objectContaining({
        tokenType: 'user',
      }),
      undefined
    );
  });

  it('displays total count', () => {
    mockUseTokenChangeHistory.mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      isFetching: false,
      error: null,
      hasMore: false,
      totalCount: 42,
      loadMore: vi.fn(),
      isLoadingMore: false,
      refetch: vi.fn(),
    });

    render(<TokenHistoryView username="testuser" />);

    expect(screen.getByText(/Showing 1 of 42 entries/i)).toBeInTheDocument();
  });

  it('handles expand all toggle', async () => {
    const user = userEvent.setup();

    render(<TokenHistoryView username="testuser" showFilters={true} />);

    const expandButton = screen.getByRole('button', { name: /expand all/i });
    await user.click(expandButton);

    // After clicking, button text should change to "Collapse All"
    expect(
      screen.getByRole('button', { name: /collapse all/i })
    ).toBeInTheDocument();
  });

  it('handles filter changes', async () => {
    const user = userEvent.setup();
    const mockSetFilter = vi.fn();

    mockUseTokenHistoryFilters.mockReturnValue({
      filters: {},
      setFilter: mockSetFilter,
      clearFilter: vi.fn(),
      clearAllFilters: vi.fn(),
      setIpAddressFilter: vi.fn(),
    });

    render(<TokenHistoryView username="testuser" showFilters={true} />);

    const tokenInput = screen.getByLabelText(/filter by token key/i);
    await user.type(tokenInput, 'abc123');

    await waitFor(() => {
      expect(mockSetFilter).toHaveBeenCalled();
    });
  });

  it('handles clear filters', async () => {
    const user = userEvent.setup();
    const mockClearAllFilters = vi.fn();

    mockUseTokenHistoryFilters.mockReturnValue({
      filters: { token: 'abc123' },
      setFilter: vi.fn(),
      clearFilter: vi.fn(),
      clearAllFilters: mockClearAllFilters,
      setIpAddressFilter: vi.fn(),
    });

    render(<TokenHistoryView username="testuser" showFilters={true} />);

    const clearButton = screen.getByRole('button', {
      name: /clear all filters/i,
    });
    await user.click(clearButton);

    expect(mockClearAllFilters).toHaveBeenCalled();
  });

  it('handles load more', async () => {
    const user = userEvent.setup();
    const mockLoadMore = vi.fn();

    mockUseTokenChangeHistory.mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      isFetching: false,
      error: null,
      hasMore: true,
      totalCount: 100,
      loadMore: mockLoadMore,
      isLoadingMore: false,
      refetch: vi.fn(),
    });

    render(<TokenHistoryView username="testuser" />);

    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    await user.click(loadMoreButton);

    expect(mockLoadMore).toHaveBeenCalled();
  });
});
