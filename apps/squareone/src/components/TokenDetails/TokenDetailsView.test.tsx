import type { TokenInfo } from '@lsst-sqre/gafaelfawr-client';
import * as gafaelfawrClient from '@lsst-sqre/gafaelfawr-client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useRepertoireUrlModule from '../../hooks/useRepertoireUrl';

// Mock hooks
vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => {
  const actual = await importOriginal<typeof gafaelfawrClient>();
  return {
    ...actual,
    useTokenDetails: vi.fn(),
    useDeleteToken: vi.fn(),
  };
});
vi.mock('../../hooks/useRepertoireUrl');

vi.mock('../TokenDate/formatters', () => ({
  formatTokenExpiration: vi.fn((expires) => {
    if (expires === null || expires === undefined) {
      return { display: 'Never expires', datetime: null };
    }
    return {
      display: 'Expires on 2025-12-31',
      datetime: '2025-12-31T00:00:00.000Z',
    };
  }),
  formatTokenCreated: vi.fn((created) => {
    if (created === null || created === undefined) {
      return { display: 'Unknown', datetime: null };
    }
    return {
      display: '2025-01-01T00:00:00.000Z',
      datetime: '2025-01-01T00:00:00.000Z',
    };
  }),
}));

// Mock TokenHistoryView component
vi.mock('../TokenHistory/TokenHistoryView', () => ({
  default: ({ username, token }: { username: string; token: string }) => (
    <div data-testid="token-history-view">
      Token History for: {token} (User: {username})
    </div>
  ),
}));

import TokenDetailsView from './TokenDetailsView';

const mockUseTokenDetails = vi.mocked(gafaelfawrClient.useTokenDetails);
const mockUseDeleteToken = vi.mocked(gafaelfawrClient.useDeleteToken);
const mockUseRepertoireUrl = vi.mocked(useRepertoireUrlModule.useRepertoireUrl);

describe('TokenDetailsView', () => {
  const baseToken: TokenInfo = {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['read:tap', 'exec:notebook', 'write:tap'],
    token: 'abc123xyz456789012345',
    token_name: 'My Laptop Token',
    created: 1704067200,
    expires: 1735689600,
    last_used: 1704153600,
    parent: null,
  };

  const mockDeleteToken = vi.fn();
  const mockRefetch = vi.fn();
  const mockOnDeleteSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useRepertoireUrl to return undefined (default behavior)
    mockUseRepertoireUrl.mockReturnValue(undefined);

    mockUseTokenDetails.mockReturnValue({
      token: baseToken,
      error: null,
      isLoading: false,
      isPending: false,
      refetch: mockRefetch,
    });
    mockUseDeleteToken.mockReturnValue({
      deleteToken: mockDeleteToken,
      isDeleting: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it('renders token details correctly', () => {
    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    expect(screen.getByText('My Laptop Token')).toBeInTheDocument();
    expect(screen.getByText('abc123xyz456789012345')).toBeInTheDocument();
    expect(screen.getByText('read:tap')).toBeInTheDocument();
    expect(screen.getByText('exec:notebook')).toBeInTheDocument();
    expect(screen.getByText('write:tap')).toBeInTheDocument();
  });

  it('renders token without name using token key', () => {
    const tokenWithoutName: TokenInfo = {
      ...baseToken,
      token_name: undefined,
    };
    mockUseTokenDetails.mockReturnValue({
      token: tokenWithoutName,
      error: null,
      isLoading: false,
      isPending: false,
      refetch: mockRefetch,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    // Should display token key as heading when no name
    const headings = screen.getAllByText('abc123xyz456789012345');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('displays parent token link when parent exists', () => {
    const tokenWithParent = {
      ...baseToken,
      parent: 'parent123456789012345',
    };
    mockUseTokenDetails.mockReturnValue({
      token: tokenWithParent,
      error: null,
      isLoading: false,
      isPending: false,
      refetch: mockRefetch,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    const parentLink = screen.getByText('parent123456789012345').closest('a');
    expect(parentLink).toHaveAttribute(
      'href',
      '/settings/tokens/parent123456789012345'
    );
  });

  it('does not display parent token when parent is null', () => {
    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    expect(screen.queryByText('Parent Token')).not.toBeInTheDocument();
  });

  it('displays token type when not "user"', () => {
    const sessionToken = {
      ...baseToken,
      token_type: 'session' as const,
    };
    mockUseTokenDetails.mockReturnValue({
      token: sessionToken,
      error: null,
      isLoading: false,
      isPending: false,
      refetch: mockRefetch,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('session')).toBeInTheDocument();
  });

  it('renders TokenHistoryView with correct props', () => {
    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    const historyView = screen.getByTestId('token-history-view');
    expect(historyView).toBeInTheDocument();
    expect(historyView).toHaveTextContent(
      'Token History for: abc123xyz456789012345'
    );
    expect(historyView).toHaveTextContent('User: testuser');
  });

  it('displays loading state', () => {
    mockUseTokenDetails.mockReturnValue({
      token: undefined,
      error: null,
      isLoading: true,
      isPending: true,
      refetch: mockRefetch,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    expect(screen.getByText('Loading token details...')).toBeInTheDocument();
  });

  it('displays 404 error state with history', () => {
    mockUseTokenDetails.mockReturnValue({
      token: undefined,
      error: new Error('HTTP 404: Not Found'),
      isLoading: false,
      isPending: false,
      refetch: mockRefetch,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    // Should show token not found message
    expect(screen.getByText('Token Not Found')).toBeInTheDocument();
    expect(screen.getByText(/no longer exists/i)).toBeInTheDocument();

    // Should still display the token key (appears multiple times)
    expect(screen.getByText('Token key:')).toBeInTheDocument();
    const tokenKeyInstances = screen.getAllByText('abc123xyz456789012345');
    expect(tokenKeyInstances.length).toBeGreaterThan(0);

    // Should show change history section
    expect(screen.getByText('Change History')).toBeInTheDocument();
    const historyView = screen.getByTestId('token-history-view');
    expect(historyView).toBeInTheDocument();
    expect(historyView).toHaveTextContent(
      'Token History for: abc123xyz456789012345'
    );

    // Should have link back to token list
    expect(screen.getByText('Return to token list')).toBeInTheDocument();
  });

  it('displays generic error state', () => {
    mockUseTokenDetails.mockReturnValue({
      token: undefined,
      error: new Error('Network error'),
      isLoading: false,
      isPending: false,
      refetch: mockRefetch,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    expect(screen.getByText('Error Loading Token')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('opens delete modal when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // DeleteTokenModal should be open (checking for delete token button)
    await waitFor(() => {
      expect(screen.getByText('Delete token')).toBeInTheDocument();
    });
  });

  it('calls deleteToken and onDeleteSuccess when deletion is confirmed', async () => {
    const user = userEvent.setup();
    mockDeleteToken.mockResolvedValue(undefined);

    render(
      <TokenDetailsView
        username="testuser"
        tokenKey="abc123xyz456789012345"
        onDeleteSuccess={mockOnDeleteSuccess}
      />
    );

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = await screen.findByText('Delete token');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteToken).toHaveBeenCalledWith(
        'testuser',
        'abc123xyz456789012345'
      );
      expect(mockOnDeleteSuccess).toHaveBeenCalled();
    });
  });

  it('handles delete error gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockDeleteToken.mockRejectedValue(new Error('Delete failed'));

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = await screen.findByText('Delete token');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('displays "No scopes" when token has empty scopes array', () => {
    const tokenWithoutScopes: TokenInfo = {
      ...baseToken,
      scopes: [],
    };
    mockUseTokenDetails.mockReturnValue({
      token: tokenWithoutScopes,
      error: null,
      isLoading: false,
      isPending: false,
      refetch: mockRefetch,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    expect(screen.getByText('No scopes')).toBeInTheDocument();
  });
});
