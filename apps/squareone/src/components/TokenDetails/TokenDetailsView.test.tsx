import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { TokenInfo } from '../../hooks/useUserTokens';

// Mock the hooks
vi.mock('../../hooks/useTokenDetails', () => ({
  default: vi.fn(),
}));

vi.mock('../../hooks/useDeleteToken', () => ({
  default: vi.fn(),
}));

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
  formatTokenLastUsed: vi.fn((lastUsed) => {
    if (lastUsed === null || lastUsed === undefined) {
      return { display: 'Never used', datetime: null };
    }
    return {
      display: 'Last used 2 hours ago',
      datetime: '2025-01-01T10:00:00.000Z',
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

import useTokenDetails from '../../hooks/useTokenDetails';
import useDeleteToken from '../../hooks/useDeleteToken';
import TokenDetailsView from './TokenDetailsView';

const mockUseTokenDetails = vi.mocked(useTokenDetails);
const mockUseDeleteToken = vi.mocked(useDeleteToken);

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
  const mockMutate = vi.fn();
  const mockOnDeleteSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTokenDetails.mockReturnValue({
      token: baseToken,
      error: undefined,
      isLoading: false,
      mutate: mockMutate,
    });
    mockUseDeleteToken.mockReturnValue({
      deleteToken: mockDeleteToken,
      isDeleting: false,
      error: undefined,
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
      error: undefined,
      isLoading: false,
      mutate: mockMutate,
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
      error: undefined,
      isLoading: false,
      mutate: mockMutate,
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
      error: undefined,
      isLoading: false,
      mutate: mockMutate,
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
      error: undefined,
      isLoading: true,
      mutate: mockMutate,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    expect(screen.getByText('Loading token details...')).toBeInTheDocument();
  });

  it('displays 404 error state', () => {
    mockUseTokenDetails.mockReturnValue({
      token: undefined,
      error: new Error('HTTP 404: Not Found'),
      isLoading: false,
      mutate: mockMutate,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    expect(screen.getByText('Token Not Found')).toBeInTheDocument();
    expect(screen.getByText(/abc123xyz456789012345/)).toBeInTheDocument();
    expect(screen.getByText('Return to token list')).toBeInTheDocument();
  });

  it('displays generic error state', () => {
    mockUseTokenDetails.mockReturnValue({
      token: undefined,
      error: new Error('Network error'),
      isLoading: false,
      mutate: mockMutate,
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
      error: undefined,
      isLoading: false,
      mutate: mockMutate,
    });

    render(
      <TokenDetailsView username="testuser" tokenKey="abc123xyz456789012345" />
    );

    expect(screen.getByText('No scopes')).toBeInTheDocument();
  });
});
